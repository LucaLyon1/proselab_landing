import { initDataFast } from 'datafast';

let datafast: Awaited<ReturnType<typeof initDataFast>> | null = null;

export async function getAnalytics() {
  if (!datafast) {
    datafast = await initDataFast({
      websiteId: 'dfid_IBYj6a8XOWT1aRRW4PExx',
      domain: 'proselab.io',
    });
  }
  return datafast;
}
