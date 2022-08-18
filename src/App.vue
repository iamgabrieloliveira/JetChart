<template>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
  <Chart
      v-if="chartVisible"
      :errors="errors"
      :chartStyle="myStyles"
      :chartData="chartData"
      :city="selectedCity"
  />
  <div v-if="!chartVisible && !districtsVisible" class="d-flex flex-column text-start">
    <h3>Choose the city</h3>
    <select required v-model="selectedCity" class="form-select" aria-label="Default select example">
      <option v-for="city in cities" selected :value="city">{{ city.nome }}</option>
    </select>
    <h3 class="mt-5">Choose the column</h3>
    <select required v-model="selectedColumn" class="form-select" aria-label="Default select example">
      <option v-for="column in columns" :value="column.sqlColumn">{{ column.name }}</option>
    </select>
    <div class="d-flex align-items-center mt-3">
      <Button :clickMethod="fetchSelectedCityData" content="Get selected data"/>
      <Button :clickMethod="fetchAllCitiesData" content="Get All data" class="mx-2"/>
      <Button :clickMethod="fetchAllCityDistricts" content="All city districts"/>
    </div>
  </div>
  <Table
      v-if="districtsVisible"
      :methodNextPage="nextPage"
      :methodPreviousPage="previousPage"
      :methodHandleChangePage="handleChangePage"
      :districts="cityDistricts"
      :finalIndex="paginateFinalIndex"
      :selectedCity="selectedCity"
  />
  <Button
      v-if="chartVisible || districtsVisible"
      :clickMethod="homePage"
      content="Back"
  />
</template>

<script lang="ts">
import {Bar} from 'vue-chartjs';
import Table from '/src/components/Table.vue';
import Chart from '/src/components/Chart.vue';
import ErrorMessage from '/src/components/ErrorMessage.vue';
import Button from '/src/components/Button.vue';
import {defineComponent} from "vue";
import {
  AllCityDataResponse,
  BaseComponentData,
  CitiesResponse,
  CityDataResponse,
  DataSet,
  DistrictsResponse
} from './types/AppTypes'

import {BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip} from 'chart.js'
import axios from './axios';
import {AxiosError} from "axios";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default defineComponent({
  name: 'BarChart',
  components: {
    Bar,
    Table,
    ErrorMessage,
    Button,
    Chart
  },
  data(): BaseComponentData {
    return {
      chartData: {
        labels: [],
        datasets: []
      },
      chartVisible: false,
      districtsVisible: false,
      cities: [],
      columns: [
        {
          name: 'Densidade demográfica hab/km²',
          sqlColumn: 'densidade_demografica',
          columnId: 1,
          columnColor: '#D40467'
        },
        {
          name: 'Mortalidade infantil',
          sqlColumn: 'mortalidade_infantil',
          columnId: 2,
          columnColor: '#F87979'
        },
        {
          name: 'Nascidos vivos',
          sqlColumn: 'nascidos_vivos',
          columnId: 3,
          columnColor: '#7B05EC'
        },
        {
          name: 'Eleitores',
          sqlColumn: 'eleitores',
          columnId: 4,
          columnColor: '#4B71EB'
        }
      ],
      selectedCity: {
        id: 0,
        nome: '',
        cidade_id: 0
      },
      selectedColumn: '',
      errors: [],
      // averages: [],
      cityDistricts: [],
      currentPage: 0,
      paginateFinalIndex: 0,
    }
  },
  computed: {
    myStyles() {
      return {
        height: '',
        width: '700px'
      }
    }
  },
  'created'() {
    axios.get('http://localhost:3000/api/cities')
        .then((res: CitiesResponse) => {
          console.log(res)
          this.cities = res.data
        }).catch((error: Error | AxiosError) => console.log(error))
  },
  methods: {
    handleChangePage(pageNum: number) {
      if (pageNum === this.currentPage) {
        return
      }
      this.currentPage = pageNum;
      axios.get(`http://localhost:3000/api/${this.selectedCity.cidade_id}/districts/${pageNum}`)
          .then(res => {
            let rows = res.data;
            let cont = (pageNum * 10) + 1;
            const newDistricts = [];

            for (let row of rows) {
              row.id = cont;
              cont++
              newDistricts.push(row)
            }
            this.cityDistricts = newDistricts;
          }).catch(error => console.log(error))
    },
    nextPage() {
      if (this.currentPage * 10 !== (this.paginateFinalIndex - 10)) {
        this.currentPage++

        axios.get(`http://localhost:3000/api/${this.selectedCity.cidade_id}/districts/${this.currentPage}`)
            .then((res: CitiesResponse) => {
              let rows = res.data;
              let cont = (this.currentPage * 10) + 1;
              const newDistricts = [];

              for (let row of rows) {
                row.id = cont;
                cont++
                newDistricts.push(row)
              }
              this.cityDistricts = newDistricts;
            }).catch((error: Error | AxiosError) => console.log(error))
      }
    },
    previousPage() {
      if (this.currentPage !== 0) {
        this.currentPage--
      }
      axios.get(`http://localhost:3000/api/${this.selectedCity.cidade_id}/districts/${this.currentPage}`)
          .then(res => {
            let rows = res.data;
            let cont = (this.currentPage * 10) + 1;
            const newDistricts = [];

            for (let row of rows) {
              row.id = cont;
              cont++
              newDistricts.push(row)
            }
            this.cityDistricts = newDistricts;
          }).catch(error => console.log(error))
    },
    fetchSelectedCityData() {
      axios.get(`http://localhost:3000/api/${this.selectedCity.cidade_id}/${this.selectedColumn}/info`)
          .then((res: CityDataResponse) => {
            console.log(res)
            let rows = res.data;
            this.setYearsLabel(rows);
            this.setChartData(rows, this.chartData.labels);
            this.chartVisible = true;
            // this.setAverageData(this.chartData.datasets);
          }).catch((error: Error | AxiosError) => console.log(error))
    },
    fetchAllCitiesData() {
      axios.get(`http://localhost:3000/api/${this.selectedCity.cidade_id}/*/info`)
          .then((res: AllCityDataResponse) => {
            let rows = res.data;
            this.createDataSets();
            this.setYearsLabel(rows);
            this.setChartDataAll(rows);
            this.chartVisible = true;
            // this.setAverageData(this.chartData.datasets);
          }).catch((error: Error | AxiosError) => console.log(error))
    },
    setYearsLabel(rows: any) {
      for (let row of rows) {
        if (this.firstPropertyValue(row)) {
          this.chartData.labels.push(row.ano);
        } else {
          let errorMessage = `Cannot find the data in year ${row.ano} to ${this.selectedCity.nome}`
          this.errors.push(errorMessage)
        }
      }
    },
    createDataSets() {
      for (let column of this.columns) {
        this.chartData.datasets.push({
          label: column.name,
          backgroundColor: column.columnColor,
          data: [],
          id: column.columnId
        });
      }
    },
    setChartDataAll(dataArr: any) {
      for (let row of dataArr) {
        for (let dataSet of this.chartData.datasets) {
          switch (dataSet.id) {
            case 1:
              if (!row.densidade_demografica) break;
              dataSet.data.push(row.densidade_demografica)
              break;
            case 2:
              if (!row.mortalidade_infantil) break;
              dataSet.data.push(row.mortalidade_infantil)
              break;
            case 3:
              if (!row.nascidos_vivos) break;
              dataSet.data.push(row.nascidos_vivos)
              break;
            case 4:
              if (!row.eleitores) break;
              dataSet.data.push(row.eleitores)
              break;
          }
        }
      }
    },
    setChartData(dataArr: any, years: number[]) {
      const chartData: DataSet = {
        label: '',
        backgroundColor: '#f87979',
        data: []
      }
      for (let year of years) {
        for (let data of dataArr) {
          if (data.ano === year) {
            chartData.data.push(this.firstPropertyValue(data))
            chartData.label = this.toRightText(this.firstPropertyName(data))
          }
        }
      }
      this.chartData.datasets.push(chartData);
    },
    firstPropertyValue(object: object) {
      return Object.values(object)[0]
    },
    firstPropertyName(object: object) {
      return Object.keys(object)[0]
    },
    toRightText(text: string) {
      for (let column of this.columns) {
        if (text === column.sqlColumn) {
          return column.name
        }
      }
    },
    fetchAllCityDistricts() {
      axios.get(`http://localhost:3000/api/${this.selectedCity.cidade_id}/districts/${this.currentPage}`)
          .then((res: DistrictsResponse) => {
            console.log(res)
            this.paginateFinalIndex = res.data.count.rows[0].count;

            let rows = res.data.rows;
            let cont = 1;
            for (let row of rows) {
              row.id = cont;
              cont++
              this.cityDistricts.push(row)
            }
            if (this.cityDistricts.length === 0) {
              this.cityDistricts.push({
                id: 1,
                nome: 'Centro'
              });
            }
            this.districtsVisible = true;
          }).catch((error: Error | AxiosError) => console.log(error))
    },
    homePage() {
      location.reload();
    },
  }
})
</script>

