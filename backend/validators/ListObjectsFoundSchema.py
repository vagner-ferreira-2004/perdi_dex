from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ListObjectsFoundSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: Optional[
        Literal["Pendente", "Encontrado", "Reprovado", "Devolvido"]
    ] = None
    id_category: Optional[int] = Field(default=None, gt=0)
    id_location: Optional[int] = Field(default=None, gt=0)
    q: Optional[str] = Field(default=None, max_length=150)
    color: Optional[str] = Field(default=None, min_length=1, max_length=50)
    found_date_from: Optional[date] = None
    found_date_to: Optional[date] = None
    order: str = "recent"
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)

    @model_validator(mode="after")
    def validDateRange(self):
        if (
            self.found_date_from
            and self.found_date_to
            and self.found_date_from > self.found_date_to
        ):
            raise ValueError("found_date_from must be before found_date_to")
        if self.order not in {"recent", "oldest"}:
            raise ValueError("order must be recent or oldest")
        return self