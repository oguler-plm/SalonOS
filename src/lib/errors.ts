export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Oturum bulunamadı") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Bu işlem için yetkiniz yok") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Kayıt bulunamadı") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Bu işlem mevcut bir kayıtla çakışıyor") {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Girilen veriler geçersiz",
    public readonly issues?: unknown,
  ) {
    super(message, 422);
  }
}
