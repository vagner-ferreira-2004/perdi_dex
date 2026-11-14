from datetime import date

from pydantic import BaseModel, field_validator, ConfigDict


class UpdateFoundDateSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")
    found_date: date

    @field_validator("found_date")
    @classmethod
    def found_date_not_in_future(cls, value: date) -> date:
        if value > date.today():
            raise ValueError("found_date cannot be in the future")
        return value
    