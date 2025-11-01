import { Hono } from "hono";
import { cors } from "hono/cors";
import { CreatePaymentSchema, PaymentSchema } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: "*",
  credentials: true,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Simple in-memory session store for development
const sessions = new Set<string>();

// Generate a simple session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Simple auth middleware
const simpleAuthMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - Missing token' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  if (!sessions.has(token)) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
  
  return await next();
};

// Admin auth routes
app.post('/api/admin/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    if (username === 'associacao2025' && password === 'associacao123') {
      const token = generateSessionToken();
      sessions.add(token);
      
      // Set session to expire after 24 hours
      setTimeout(() => {
        sessions.delete(token);
      }, 24 * 60 * 60 * 1000);

      return c.json({ success: true, token });
    } else {
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }
  } catch (error) {
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

app.get('/api/admin/status', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ authenticated: false }, 401);
  }
  
  const token = authHeader.substring(7);
  
  if (sessions.has(token)) {
    return c.json({ authenticated: true });
  } else {
    return c.json({ authenticated: false }, 401);
  }
});

app.post('/api/admin/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessions.delete(token);
  }

  return c.json({ success: true });
});

// Public routes
app.get("/api/payments", async (c) => {
  try {
    const stmt = c.env.DB.prepare(`
      SELECT * FROM payments 
      ORDER BY payment_date DESC, created_at DESC
    `);
    const result = await stmt.all();
    
    const payments = result.results?.map(row => PaymentSchema.parse(row)) || [];
    
    return c.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return c.json({ error: "Erro ao buscar pagamentos" }, 500);
  }
});

app.get("/api/members", async (c) => {
  try {
    const stmt = c.env.DB.prepare(`
      SELECT * FROM members 
      WHERE is_active = 1
      ORDER BY name ASC
    `);
    const result = await stmt.all();
    
    return c.json({ members: result.results || [] });
  } catch (error) {
    console.error("Error fetching members:", error);
    return c.json({ error: "Erro ao buscar membros" }, 500);
  }
});

// Protected admin routes
app.post("/api/payments", simpleAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = CreatePaymentSchema.parse(body);
    
    const stmt = c.env.DB.prepare(`
      INSERT INTO payments (member_name, amount, payment_date, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    const result = await stmt.bind(
      validatedData.member_name,
      validatedData.amount,
      validatedData.payment_date
    ).run();
    
    if (!result.success) {
      throw new Error("Erro ao inserir pagamento");
    }
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: "Pagamento adicionado com sucesso"
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Erro interno do servidor" }, 500);
  }
});

app.post("/api/members", simpleAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return c.json({ error: "Nome é obrigatório" }, 400);
    }
    
    const stmt = c.env.DB.prepare(`
      INSERT INTO members (name, email, phone, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    const result = await stmt.bind(
      body.name.trim(),
      body.email || null,
      body.phone || null
    ).run();
    
    if (!result.success) {
      throw new Error("Erro ao inserir membro");
    }
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: "Membro adicionado com sucesso"
    });
  } catch (error) {
    console.error("Error creating member:", error);
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: "Já existe um membro com este nome" }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Erro interno do servidor" }, 500);
  }
});

app.put("/api/members/:id", simpleAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return c.json({ error: "Nome é obrigatório" }, 400);
    }
    
    const stmt = c.env.DB.prepare(`
      UPDATE members 
      SET name = ?, email = ?, phone = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    
    const result = await stmt.bind(
      body.name.trim(),
      body.email || null,
      body.phone || null,
      body.is_active !== false ? 1 : 0,
      id
    ).run();
    
    if (!result.success) {
      throw new Error("Erro ao atualizar membro");
    }
    
    return c.json({ 
      success: true,
      message: "Membro atualizado com sucesso"
    });
  } catch (error) {
    console.error("Error updating member:", error);
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: "Já existe um membro com este nome" }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Erro interno do servidor" }, 500);
  }
});

app.delete("/api/members/:id", simpleAuthMiddleware, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    const stmt = c.env.DB.prepare(`
      UPDATE members 
      SET is_active = 0, updated_at = datetime('now')
      WHERE id = ?
    `);
    
    const result = await stmt.bind(id).run();
    
    if (!result.success) {
      throw new Error("Erro ao desativar membro");
    }
    
    return c.json({ 
      success: true,
      message: "Membro desativado com sucesso"
    });
  } catch (error) {
    console.error("Error deactivating member:", error);
    return c.json({ error: "Erro interno do servidor" }, 500);
  }
});

export default app;
