from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UpdateUserSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    phone: Optional[str] = Field(default=None, min_length=8, max_length=20)
    email: Optional[EmailStr] = None

    @field_validator("name", "phone")
    @classmethod
    def stripValues(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value is not None else value
