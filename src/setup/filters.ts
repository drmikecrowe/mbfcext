import Vue from "vue";

// ** Load filters ** //
import { DateFilter } from "utils"; // Import date
Vue.filter("date", DateFilter);
