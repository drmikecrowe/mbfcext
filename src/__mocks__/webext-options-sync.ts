/**
@example
{
    // Recommended
    defaults: {
        color: 'blue'
    },
    // Optional
    migrations: [
        savedOptions => {
            if (savedOptions.oldStuff) {
                delete savedOptions.oldStuff;
            }
        }
    ],
}
*/
export interface Setup<TOptions extends Options> {
  storageName?: string;
  logging?: boolean;
  defaults?: TOptions;
  /**
   * A list of functions to call when the extension is updated.
   */
  migrations?: Array<Migration<TOptions>>;
}
/**
A map of options as strings or booleans. The keys will have to match the form fields' `name` attributes.
*/
export interface Options {
  [key: string]: string | number | boolean;
}
export declare type Migration<TOptions extends Options> = (
  savedOptions: TOptions,
  defaults: TOptions
) => void;
export class OptionsSync {
  public config: Options = {};
  async getAll() {
    return this.config;
  }
  async set(obj: Options) {
    Object.assign(this.config, obj);
  }
}
