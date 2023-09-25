import { request } from "@strapi/helper-plugin";

const auditLogRequest = {
  getAllAuditLogs: async (params) => {
    return await request("/audit-logger/find", {
      method: "GET",
      params,
    });
  },
};

export default auditLogRequest;
