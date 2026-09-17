import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { registerSchema } from "@/lib/validation/auth";
import { registerBusiness } from "@/server/services/business.service";

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const input = registerSchema.parse(body);
  const { business, user } = await registerBusiness(input);

  return NextResponse.json(
    {
      business: { id: business.id, name: business.name, slug: business.slug },
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    },
    { status: 201 },
  );
});
