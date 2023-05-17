import { useState, useEffect, useCallback } from "react";

const fetchCurrentWeather = (locationName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-E69BC537-D947-447E-87F2-8489B9DCD1AF&locationName=${locationName}`
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // STEP 1: 定義`locationData` 把回傳資料中會用到的部分取出來
      const locationData = data.records.location[0];

      // STEP 2: 將風速（WDSD）、溫度（TEMP）、濕度（HUMD）、天氣（Weather）取出
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["WDSD", "TEMP", "HUMD", "Weather"].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        },
        {}
      );

      // STEP 3: 要使用到 React components 中的資料
      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        description: weatherElements.Weather,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD,
      };
    });
};

const fetchWeatherForecast = (cityName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-E69BC537-D947-447E-87F2-8489B9DCD1AF&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      // STEP 3: 要使用到 React components 中的資料
      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
};

const fetchMoment = (cityName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=CWB-E69BC537-D947-447E-87F2-8489B9DCD1AF&CountyName=${cityName}`
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const location = data.records.locations.location[0];

      if (!location) return null;

      const now = new Date();

      const reg = new RegExp("\\/");
      const nowDate = Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(now)
        .replace(reg, "-")
        .replace(reg, "-");

      const locationDate =
        location.time && location.time.find((time) => time.Date === nowDate);

      const sunRiseTimestamp = new Date(
        `${locationDate.Date} ${locationDate.SunRiseTime}`
      ).getTime();

      const sunSetTimestamp = new Date(
        `${locationDate.Date} ${locationDate.SunSetTime}`
      ).getTime();

      const nowTimestamp = new Date().getTime();

      return sunRiseTimestamp <= nowTimestamp && sunSetTimestamp >= nowTimestamp
        ? { moment: "day" }
        : { moment: "night" };
    });
};

const useWeatherApi = (currentLocation) => {
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    description: "",
    temperature: 0,
    windSpeed: 0,
    humid: 0,
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    moment: "day",
    isLoading: true,
  });

  // const { locationName } = weatherElement;
  const { locationName, cityName } = currentLocation;

  const fetchData = useCallback(() => {
    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    // IIFE: Immediately Invoked Function Expression
    (async () => {
      const [currentWeather, weatherForecast, moment] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchWeatherForecast(cityName),
        fetchMoment(cityName),
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        ...moment,
        isLoading: false,
      });
    })();
  }, [locationName, cityName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
};

export default useWeatherApi;
