export interface Column {    name: string,    sqlColumn: string,    columnId: number,    columnColor: string}export interface DataSet {    label?: string,    backgroundColor: string,    data: number[],    id?: number}export interface ChartData {    labels: number[],    datasets: DataSet[]}export interface BaseComponentData {    chartData: ChartData,    chartVisible: boolean,    districtsVisible: boolean,    cities: City[],    columns: Column[],    selectedCity: City,    selectedColumn: string,    errors: string[],    cityDistricts: any,    currentPage: number,    paginateFinalIndex: number}export interface City {    id: number,    nome: string,    cidade_id: number}export interface CitiesResponse {    data: City[],}export interface District {    id: number,    bairro_id: number,    nome: string,    cidade_id: number}export interface DistrictsResponse {    data: {        rows: District[],        count: {            rows: { count: number }[]        }    }}export interface CityDataResponse {    data: {        label?: number,        ano: number    }}export interface AllCityDataResponse {    data: {        ano: number,        cidade_id: number,        densidade_demografica?: number,        eleitores?: number,        informacao_id: number,        mortalidade_infantil?: number,        nascidos_vivos?: number,    }}export interface ChartStyle {    height: string,    width: string}