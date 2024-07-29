import { defineStore } from 'pinia';
import axios from 'axios';
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
// Axios를 사용해 HTTP 요청을 보내기 위한 Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline',
    params: {
        lang: 'ko',
        key: '969H8SFJP3GJPUHAPCVP5CFND',
        unitGroup: 'metric',
    },
});
// ipify API를 기본값으로 하는 Axios 인스턴스 생성
const axiosInstance2 = axios.create({
    baseURL: 'https://api64.ipify.org/?format=json',
});
const axiosInstance3 = axios.create({
    baseURL: 'https://freeipapi.com/api/json',
});
export const useWeatherStore = defineStore('weather', () => {
    // 초기 검색 지역
    const address = ref('seoul');
    // 현재 날씨 정보 데이터
    const currentConditions = ref(null);
    // 일별 날씨 객체가 담긴 배열
    const days = ref(null);
    // 검색 날씨 데이터
    const searchData = ref([]); 
    // 오늘 시간대별 데이터 계산
    const hours = computed(() => {
        return days.value
        // 날씨 객체 배열에서 오늘 날짜와 일치하는 객체 1개를 찾음
        ?.find((v) => v.datetime === dayjs().format('YYYY-MM-DD'))
        // 현재 시각 이후 시간만 시간별 데이터에 포함
        ?.hours.filter((v) => v.datetime > dayjs().format('HH:mm:ss'));
    });
    // 미래 날짜의 날씨 예보 데이터 계산하기
    const forecast = computed(() => {
        return days.value?.filter((v) => v.datetime > dayjs().format('YYYY-MM-DD'));
    });
    // 현재 날씨 API 불러오기
    const getCurrentWeatherInfo = async () => {
        try {
            const res = await axiosInstance.get('/' + address.value);
            currentConditions.value = res.data.currentConditions;
            days.value = res.data.days;
        } catch (e) {
            alert(e.response?.data ? e.response?.data : e.message);
        }
    };
    // 지역명(city)으로 날씨 API 검색
    const getSearchWeatherInfo = async (city) => {
        try {
            const res = await axiosInstance.get('/' + city);
            // 응답 데이터 객체로 필요한 데이터 제공
            const printData = {
                address: res.data.address,
                feelslikemax: res.data.days[0].feelslikemax,
                feelslikemin: res.data.days[0].feelslikemin,
                icon: res.data.currentConditions.icon,
                temp: res.data.currentConditions.temp,
            };
            // 이미 추가한 지역이면 중복으로 추가하지 않기
            if (searchData.value.findIndex((v) => v.address === res.data.address) === -1) {
                searchData.value.push(printData);
            } else {
                alert('이미 조회한 지역입니다.');
            }
        } catch (e) {
            alert(e.response?.data ? e.response?.data : e.message);
        }
    };
    // 사용자 지역명 구하기
    const getCityName = async () => {
        try {
            const res = await axiosInstance2.get();
            const ip = res.data.ip;
            const res2 = await axiosInstance3.get('/' + ip);
            address.value = res2.data.cityName;
        } catch (e) {
            alert(e.response?.data ? e.response?.data : e.message);
        }
    };
    return { address, currentConditions, hours, forecast, searchData, getCurrentWeatherInfo, getSearchWeatherInfo, getCityName, };
});
