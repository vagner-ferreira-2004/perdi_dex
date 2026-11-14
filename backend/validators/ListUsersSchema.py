from pydantic import BaseModel, ConfigDict, Field


class ListUsersSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=25, ge=1, le=100)
