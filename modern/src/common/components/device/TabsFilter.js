import React, { useState } from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
} from "@mui/material";
import moment from "moment";
import { useTranslation } from "../../components/LocalizationProvider";

const TabsFilter = ({ onSubmitFilter, hideFilter }) => {
  const t = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("");
  const [customDateRange, setCustomDateRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const convertToISO8601 = (date) => date.toISOString().split(".")[0] + "Z";

  const handleFilterChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedFilter(selectedValue);
    setCustomDateRange(selectedValue === "custom");
  };

  const handleSubmit = async () => {
    setFromDate("");
    setToDate("");
    const value = selectedFilter;
    const currentDate = new Date();
    const firstDayOfWeek = new Date(currentDate);
    firstDayOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    let filterName = "";
    let toDate = "";
    let fromDate = "";

    switch (value) {
      case "today":
        fromDate = moment().startOf("day");
        toDate = moment().endOf("day");
        filterName = t("today");
        break;
      case "thisWeek":
        fromDate = moment().startOf("week");
        toDate = moment().endOf("week");
        filterName = t("thisWeek");
        break;
      case "lastWeek":
        fromDate = moment().subtract(1, "week").startOf("week");
        toDate = moment().subtract(1, "week").endOf("week");
        filterName = t("lastWeek");
        break;
      case "thisMonth":
        fromDate = moment().startOf("month");
        toDate = moment().endOf("month");
        filterName = t("thisMonth");
        break;
      case "prevMonth":
        fromDate = moment().subtract(1, "month").startOf("month");
        toDate = moment().subtract(1, "month").endOf("month");
        filterName = t("reportPreviousMonth");
        break;
      case "yesterday":
        fromDate = moment().subtract(1, "day").startOf("day");
        toDate = moment().subtract(1, "day").endOf("day");
        filterName = t("reportYesterday");
        break;
      case "custom":
        if (startDate && endDate) {
          fromDate = new Date(startDate);
          toDate = new Date(endDate);
          filterName = `${startDate}  -  ${endDate}`;
        }
        break;
      default:
        break;
    }

    const selectedValue = {
      toDate: toDate.toISOString(),
      fromDate: fromDate.toISOString(),
      filterName,
    };
    onSubmitFilter(selectedValue);
  };

  return (
    <div style={{ padding: "22px" }}>
      <RadioGroup
        aria-label="date-filter"
        name="date-filter"
        value={selectedFilter}
        onChange={handleFilterChange}
      >
        <FormControlLabel
          value="today"
          control={<Radio />}
          label={t("today")}
        />
        <FormControlLabel
          value="yesterday"
          control={<Radio />}
          label={t("reportYesterday")}
        />
        <FormControlLabel
          value="thisWeek"
          control={<Radio />}
          label={t("thisWeek")}
        />
        <FormControlLabel
          value="lastWeek"
          control={<Radio />}
          label={t("lastWeek")}
        />
        <FormControlLabel
          value="thisMonth"
          control={<Radio />}
          label={t("reportThisMonth")}
        />
        <FormControlLabel
          value="prevMonth"
          control={<Radio />}
          label={t("previousMonth")}
        />
        <FormControlLabel value="custom" control={<Radio />} label="Custom" />
      </RadioGroup>

      {customDateRange && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <TextField
            label={t("fromDate")}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ width: "49%" }}
          />
          <TextField
            label={t("toDate")}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ width: "49%" }}
          />
        </div>
      )}
      <Button
        disabled={selectedFilter == ""}
        className="customButton"
        variant="contained"
        onClick={handleSubmit}
      >
        Submit
      </Button>
      <Button
        sx={{ marginLeft: "10px" }}
        className="cancelButton"
        variant="contained"
        onClick={(e) => hideFilter(true)}
      >
        Cancel
      </Button>
    </div>
  );
};

export default TabsFilter;
