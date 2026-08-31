import { ArrayMinSize, ArrayUnique, IsArray, IsUUID } from "class-validator";

export class AddGroupMembersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  userIds!: string[];
}
