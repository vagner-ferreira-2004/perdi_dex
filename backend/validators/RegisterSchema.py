from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=150)
    cpf: str = Field(pattern=r"^\d{11}$")
    phone: str = Field(min_length=8, max_length=20)
    email: EmailStr
    rgm: Optional[str] = Field(default=None, min_length=1, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    id_profile: int = Field(gt=0)

    @field_validator("name", "phone", "rgm")
    @classmethod
    def stripValues(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value is not None else value


class LoginSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ChangePasswordSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)
