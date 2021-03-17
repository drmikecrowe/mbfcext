import { COMBINED } from "utils/constants";
import { ICombined, ISources } from "utils/definitions";
import { logger } from "utils/logger";
import { UpdatedSourcesMessage } from "utils/messages";
import { fetch as fetchPolyfill } from "whatwg-fetch";
import { BaseSourcesProcessor } from "./BaseSourcesProcessor";

const log = logger("mbfc:background:sources");

export class SourcesProcessor extends BaseSourcesProcessor {
  retrievingPromise: Promise<ISources> | undefined;

  async getSources(): Promise<ISources> {
    if (this.areSourcesLoaded()) return this.sources;
    if (!this.retrievingPromise) this.retrievingPromise = this.retrieveRemote();
    return this.retrievingPromise;
  }

  async retrieveRemote(): Promise<ISources> {
    try {
      const res = await fetchPolyfill(COMBINED);
      const combined: ICombined = await res.json();
      console.log(
        `Loaded combined data ${combined.version} from ${combined.date}`
      );
      if (!combined) return this.sources;
      this.initializeCombined(combined);
      const msg = new UpdatedSourcesMessage(this.sources);
      await msg.sendMessage(true);
    } catch (err) {
      console.error(`ERROR Loading sources: `, err);
    }
    return this.sources;
  }
}
