import z from "zod";

export const PaymentSchema = z.object({
  id: z.number(),
  member_name: z.string(),
  amount: z.number(),
  payment_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreatePaymentSchema = z.object({
  member_name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number().positive("Valor deve ser positivo"),
  payment_date: z.string().min(1, "Data é obrigatória"),
});

export const MemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  is_active: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateMemberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePayment = z.infer<typeof CreatePaymentSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type CreateMember = z.infer<typeof CreateMemberSchema>;
