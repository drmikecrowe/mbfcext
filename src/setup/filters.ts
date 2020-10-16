export {}
const log = require('debug')('mbfc:setup:filters');
import Vue from "vue";

// ** Load filters ** //
import DateFilter from "utils/filters/date"; // Import date
Vue.filter("date", DateFilter);
