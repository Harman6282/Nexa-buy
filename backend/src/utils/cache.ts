import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 180, checkperiod: 120 });
