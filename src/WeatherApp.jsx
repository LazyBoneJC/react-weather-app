import { React, useState, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";
import WeatherCard from "./WeatherCard";
import useWeatherApi from "./useWeatherApi";
import WeatherSetting from "./WeatherSetting";
import { findLocation } from "./utils";
// import sunriseAndSunsetData from "./sunrise-sunset.json"; // 匯入日出日落資料

const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282",
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc",
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// const getMoment = (locationName) => {
//   // 從日出日落時間中找出符合的地區
//   const location = sunriseAndSunsetData.find(
//     (data) => data.locationName === locationName
//   );

//   // 找不到就回傳 null
//   if (!location) return null;

//   // 取得當前時間
//   const now = new Date();

//   // 將當前時間以 "2023-05-09" 的格式呈現
//   const reg = new RegExp("\\/");
//   const nowDate = Intl.DateTimeFormat("zh-TW", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   })
//     .format(now)
//     .replace(reg, "-")
//     .replace(reg, "-");

//   const locationDate =
//     location.time && location.time.find((time) => time.dataTime === nowDate);

//   // 將日出日落以及當前時間轉成 TimeStamp
//   const sunriseTimestamp = new Date(
//     `${locationDate.dataTime} ${locationDate.sunrise}`
//   ).getTime();

//   const sunsetTimestamp = new Date(
//     `${locationDate.dataTime} ${locationDate.sunset}`
//   ).getTime();

//   const nowTimestamp = now.getTime();

//   // 若當前時間介於日出和日落中間，則表示為白天，否則為晚上
//   return sunriseTimestamp <= nowTimestamp && nowTimestamp <= sunsetTimestamp
//     ? "day"
//     : "night";
// };

const WeatherApp = () => {
  const storageCity = localStorage.getItem("cityName"); // get cityName from localStorage
  const [currentCity, setCurrentCity] = useState(storageCity || "臺北市");
  const currentLocation = findLocation(currentCity) || {};
  const [weatherElement, fetchData] = useWeatherApi(currentLocation); // Custom hook
  const [currentTheme, setCurrentTheme] = useState("light");
  const [currentPage, setCurrentPage] = useState("WeatherCard");
  const { moment } = weatherElement;

  // const moment = useMemo(
  //   () => getMoment(weatherElement.locationName + "市"),
  //   [weatherElement.locationName]
  // );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);

  useEffect(() => {
    localStorage.setItem("cityName", currentCity);
  }, [currentCity]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === "WeatherCard" && (
          <WeatherCard
            weatherElement={weatherElement}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
            cityName={currentLocation.cityName}
          />
        )}

        {currentPage === "WeatherSetting" && (
          <WeatherSetting
            cityName={currentLocation.cityName}
            setCurrentPage={setCurrentPage}
            setCurrentCity={setCurrentCity}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;
