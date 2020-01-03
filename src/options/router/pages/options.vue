<template>
  <form class="w-full" id="optionsStorage">
    <vue-form-generator :schema="schema" :model="model" :options="formOptions"> </vue-form-generator>
  </form>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import OptionsSync from "webext-options-sync";

const log = require("debug")("ext:options");

const simpleSetup = {
  defaults: {
    name: "John Doe",
    password: "J0hnD03!x4",
    email: "john.doe@gmail.com",
    status: true,
  },
  migrations: [OptionsSync.migrations.removeUnused],
  logging: true,
};

const optionsStorage = new OptionsSync(simpleSetup);

import VueFormGenerator from "vue-form-generator/dist/vfg-core.js";
Vue.use(VueFormGenerator);

const baseClasses = {
  styleClasses: "flex items-center mb-6",
  labelClasses: "block w-1/3 font-bold text-right mb-1 mb-0 pr-4",
};

const inputClasses = {
  fieldClasses:
    "form-input bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500",
  ...baseClasses,
};

const checkboxClasses = {
  fieldClasses: "form-checkbox h-6 w-6",
  ...baseClasses,
};

@Component
export default class Options extends Vue {
  model: any = {};

  async loadOptions(): Promise<any> {
    const options = await optionsStorage.getAll();
    log(`Options retrieved in loadOptions: `, options);
    this.model = options;
    return this.model;
  }

  mounted() {
    log(`Linking to form`);
    optionsStorage.syncForm("#optionsStorage");
  }

  data() {
    this.loadOptions().then(m => log(`Model now: `, m));
    return {
      model: this.model,
      schema: {
        groups: [
          {
            legend: "User Details",
            fields: [
              {
                type: "input",
                inputType: "text",
                label: "Name",
                model: "name",
                id: "name",
                inputName: "name",
                placeholder: "Your name",
                featured: true,
                required: true,
                ...inputClasses,
              },
              {
                type: "input",
                inputType: "email",
                label: "E-mail",
                model: "email",
                id: "email",
                inputName: "email",
                placeholder: "User's e-mail address",
                ...inputClasses,
              },
              {
                type: "input",
                inputType: "password",
                label: "Password",
                model: "password",
                inputName: "password",
                min: 6,
                required: true,
                hint: "Minimum 6 characters",
                validator: "string",
                ...inputClasses,
              },
            ],
          },
          {
            legend: "Skills & Status",
            fields: [
              {
                type: "checkbox",
                label: "Status",
                model: "status",
                inputName: "status",
                default: true,
                ...checkboxClasses,
              },
            ],
          },
        ],
      },

      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true,
        validateAsync: true,
      },
    };
  }
}
</script>

<style lang="scss">
@import "../../../assets/colors.scss";

// from: https://jsfiddle.net/zoul0813/wmdjgz6t/
.vue-form-generator {
  legend {
    font-weight: bold;
    font-size: 1rem;
  }
  .form-group {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 1.6rem;
    padding: 5px 10px;
    label {
      padding: 5px 0;
      margin-right: 1rem;
    }
    &.featured label {
      font-weight: bold;
    }
    &.required label::after {
      content: "*";
      font-weight: normal;
      color: red;
      position: absolute;
      padding-left: 0.2em;
      font-size: 1em;
    }
    &.disabled label {
      color: $c-light;
    }
  }
  .field-wrap {
    display: flex;
    flex: 0 1 300px;
    .wrapper {
      width: 100%;
    }
    .form-control {
      display: block;
      width: 100%;
      outline: 0;
      padding: 5px;
      font-style: italic;
      // color: $white;
    }
  }
  .hint {
    flex: 1 1 100%;
    text-align: right;
    font-style: italic;
  }
}
</style>
