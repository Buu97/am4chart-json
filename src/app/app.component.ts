import { AfterViewInit, Component, NgZone } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldlow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

const colors = new am4core.ColorSet();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  private activeChartType: string;
  private chart: am4charts.Chart;
  private data = [{
    id: 'LT',
    "country": "Lithuania",
    "litres": 501.9,
    "units": 250
  }, {
    id: 'CZ',
    "country": "Czech Republic",
    "litres": 301.9,
    "units": 222
  }, {
    id: 'IE',
    "country": "Ireland",
    "litres": 201.1,
    "units": 170
  }, {
    id: 'DE',
    "country": "Germany",
    "litres": 165.8,
    "units": 122
  }, {
    id: 'AU',
    "country": "Australia",
    "litres": 139.9,
    "units": 99
  }, {
    id: 'AT',
    "country": "Austria",
    "litres": 128.3,
    "units": 85
  }, {
    id: 'GB',
    "country": "UK",
    "litres": 99,
    "units": 93
  }, {
    id: 'BE',
    "country": "Belgium",
    "litres": 60,
    "units": 50
  }, {
    id: 'NL',
    "country": "The Netherlands",
    "litres": 50,
    "units": 42
  }];
  private chartConfigs = {
    'XYChart1': {
      valeur_prop: 'valueY',
      category_prop: 'categoryX',
      type: 'XYChart',
      xAxes: [{
        type: 'CategoryAxis',
        dataFields: {
          category: 'country'
        }
      }],
      yAxes: [{
        type: 'ValueAxis'
      }],
      series: [{
        type: 'ColumnSeries',
        "dataFields": {
          "valueY": "litres",
          "categoryX": "country"
        }
      }]
    },
    'XYChart2': {
      valeur_prop: 'valueY',
      category_prop: 'categoryX',
      type: 'XYChart',
      xAxes: [{
        type: 'CategoryAxis',
        dataFields: {
          category: 'country'
        }
      }],
      yAxes: [{
        type: 'ValueAxis'
      }],
      series: [{
        type: 'LineSeries',
        "dataFields": {
          "valueY": "litres",
          "categoryX": "country"
        }
      }],
    },
    'XYChart3': {
      valeur_prop: 'valueX',
      category_prop: 'categoryY',
      type: 'XYChart',
      yAxes: [{
        type: 'CategoryAxis',
        dataFields: {
          category: 'country'
        }
      }],
      xAxes: [{
        type: 'ValueAxis'
      }],
      series: [{
        type: 'ColumnSeries',
        "dataFields": {
          "valueX": "litres",
          "categoryY": "country"
        }
      }]
    },
    'RadarChart': {
      valeur_prop: 'valueY',
      category_prop: 'categoryX',
      type: 'RadarChart',
      "xAxes": [{
        "type": "CategoryAxis",
        "dataFields": {
          "category": "country"
        }
      }],
      "yAxes": [{
        "type": "ValueAxis"
      }],
      series: [
        {
          "type": "RadarColumnSeries",
          "name": "Units",
          "dataFields": {
            "valueY": "litres",
            "categoryX": "country"
          },
          "columns": {
            "tooltipText": "Series: {name}\nCategory: {categoryX}\nValue: {valueY}"
          }
        }
      ]
    },
    'MapChart': {
      type: 'MapChart',
      geodata: am4geodata_worldlow,
      "projection": "Miller",
      "series": [{
        "type": "MapPolygonSeries",
        "useGeodata": true,
        "exclude": ["AQ"],
        "mapPolygons": {
          "tooltipText": "{name}",
        },
        data: this.data.map(d => ({ ...d, value: d.litres })),
        "heatRules": [{
          "target": "mapPolygons.template",
          "property": "fill",
          "min": "#f7f7f7",
          "max": "#1a69af"
        }],
        "zoomControl": {
          "slider": {
            "height": 100
          }
        }
      }]
    }
  }

  constructor(private zone: NgZone) { }

  ngAfterViewInit() {
    this.browserOnly(this.renderContainer);
  }

  private renderContainer() {
    // ce dont tu dois tenir component
    // let chart = am4core.create('container', am4chart.XYChart);
    // chart.processConfig(config);
    // chart.data = data;
    // fin

    am4core.useTheme(am4themes_animated);

    const chartChoices = ['XYChart1', 'XYChart2', 'XYChart3', 'RadarChart', 'MapChart', 'tableau'];

    const mainContainer = am4core.createFromConfig({
      width: '100%',
      height: '100%',
      layout: 'horizontal'
    }, 'container', am4core.Container) as am4core.Container;

    const chartContainer = mainContainer.createChild(am4core.Container);
    chartContainer.processConfig({
      height: '100%',
      width: '80%',
      type: 'Container'
    });

    let chart: am4charts.Chart = chartContainer.createChild(am4charts.XYChart);
    chart.processConfig(this.chartConfigs['XYChart1']);
    chart.data = this.data;

    this.activeChartType = 'XYChart1';
    this.chart = chart;

    const buttonContainer = mainContainer.createChild(am4core.Container);
    buttonContainer.processConfig({
      height: '100%',
      width: '20%',
      type: 'Container',
      layout: 'vertical',
      children: chartChoices.map(choice => ({
        id: choice,
        events: {
          hit: (e) => {
            if (e?.target?.id !== this.activeChartType) {
              this.activeChartType = e.target.id;
              chart.setVisibility(false);
  
              const config = this.chartConfigs[e.target.id];
              let replacementChart: am4charts.Chart;
  
              if (config.type == 'MapChart') {
                replacementChart = chartContainer.createChild(am4maps.MapChart);
  
                (replacementChart as am4maps.MapChart).zoomControl = new am4maps.ZoomControl();
                (replacementChart as am4maps.MapChart).zoomControl.valign = "top";
              } else {
                replacementChart = chartContainer.createChild(am4charts[config.type]);
              }
  
              replacementChart.setVisibility(false);
              replacementChart.processConfig(config);
              replacementChart.data = this.data;
  
              replacementChart.setVisibility(true);
              chart.dispose();
  
              chart = undefined;
              chart = replacementChart;
  
              this.chart = chart;
            }
          }
        },
        href: `/assets/${choice}.png`,
        type: 'Image',
        clickable: true
      }))
    });
  }

  public addSeries() {
    const currentConfig = this.chartConfigs[this.activeChartType];

    // J'utilise une syntaxe avancée qui n'est pas encore supportée par tous les navigateurs
    // Je pense que pour le BO, ça ira
    // mais si vous voulez faire attention, essayez une syntaxe plus commune
    this.chart.processConfig({
      ...currentConfig,
      series: [
        ...currentConfig.series,
        {
          ...currentConfig.series[0],
          name: 'stuff',
          dataFields: {
            [currentConfig.valeur_prop]: 'units',
            [currentConfig.category_prop]: 'country'
          }
        }
      ]
    });
  }

  private browserOnly(f: Function) {
    const self = this;
    this.zone.runOutsideAngular(() => f.apply(self));
  }
}
