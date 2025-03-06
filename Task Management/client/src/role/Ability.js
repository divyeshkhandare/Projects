import { getUserDetails } from "../userDetails";

export const Ability = (roles = []) => {
  let role = getUserDetails()?.role;
  if (roles.includes(role)) {
    return true;
  } else {
    return false;
  }
};