from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class UpdateObjectFoundSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id_category: Optional[int] = Field(default=None, gt=0)
    id_location: Optional[int] = Field(default=None, gt=0)
    found_date: Optional[date] = None
    color: Optional[str] = Field(default=None, min_length=1, max_length=50)
    brand: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, min_length=1)

    @field_validator("color", "brand", "description")
    @classmethod
    def stripValues(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value is not None else value

    @field_validator("found_date")
    @classmethod
    def foundDateNotInFuture(cls, value: Optional[date]) -> Optional[date]:
        if value is not None and value > date.today():
            raise ValueError("found_date cannot be in the future")
        return value

    @model_validator(mode="after")
    def requireUpdate(self):
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided")
        return self
