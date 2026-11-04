from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CreateObjectFoundSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id_category: int = Field(gt=0)
    id_location: int = Field(gt=0)
    found_date: Optional[date] = None
    color: str = Field(min_length=1, max_length=50)
    brand: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1)

    @field_validator("color", "brand", "description")
    @classmethod
    def stripValues(cls, value: str) -> str:
        return value.strip()

    @field_validator("found_date")
    @classmethod
    def found_date_not_in_future(cls, value: Optional[date]) -> Optional[date]:
        if value is not None and value > date.today():
            raise ValueError("found_date cannot be in the future")
        return value