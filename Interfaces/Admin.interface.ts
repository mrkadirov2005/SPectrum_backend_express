export interface IAdmin {
    email: string;
    password: string;
    username: string;
    is_active: boolean;
    accessible_groups_list: string[];
    uuid: string;
    client_id: string; // Added client_id to the interface
    logs: string[];
  }