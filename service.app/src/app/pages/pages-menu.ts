import { NbMenuItem } from "@nebular/theme";

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: "Balance",
    icon: { icon: "grid", pack: "eva" },
    data: {
      permission: 'view',
      resource: 'balance_section'
    },
    children: [
      {
        title: "Daily Gas Balance",
        link: "/balance",
        home: true,
        data: {
          permission: 'view',
          resource: 'balance'
        },
      
      },
      {
        title: "Layout Configuration",
        link: "/layout",
        data: {
          permission: 'view',
          resource: 'layout'
        },
      },
      {
        title: "Simulations",
        link: "/simulations",
        data: {
          permission: 'view',
          resource: 'simulations'
        },
      },
      {
        title: "Virtual",
    /*     icon: { icon: "grid", pack: "eva" }, */
        data: {
          permission: 'view',
          resource: 'virtual-section'
        },
        children: [
          {
            title: "Virtual Balances",
            link: "/virtual-balance",
            data: {
              permission: 'view',
              resource: 'virtual-balance'
            },
          },
          {
            title: "Virtual Logistic Contracts",
            //   icon: "file-text-outline",
            link: "/virtual-logistic-contracts",
            data: {
              permission: 'view',
              resource: 'virtual-logistic-contracts'
            },
          },
          {
            title: "Virtual Swaps Contracts",
            //   icon: "file-text-outline",
            link: "/virtual-swaps-contracts",
            data: {
              permission: 'view',
              resource: 'virtual-swaps-contracts'
            },
          },
          {
            title: "Virtual Purchase/Sale",
            link: "/virtual-purchase-sale-contracts",
            data: {
              permission: 'view',
              resource: 'virtual-purchase-sale-contracts'
            },
          },
      
        ],
      }

    ],
  },

  {
    title: "Contracts",
    icon: { icon: "file-contract", pack: "fas" },
    data: {
      permission: 'view',
      resource: 'logistic_contracts_section'
    },
    children: [
      {
        title: "Logistic Contracts",
        //   icon: "file-text-outline",
        link: "/logistic-contracts",
        data: {
          permission: 'view',
          resource: 'logistic-contracts'
        },
      },
      {
        title: "Nominations",
        //   icon: "calendar-outline",
        link: "/nomination",
        data: {
          permission: 'view',
          resource: 'nomination'
        },
      },
      {
        title: "Assignments",
        //  icon: "checkmark-square-outline",
        link: "/assignments",
        data: {
          permission: 'view',
          resource: 'assignments'
        },
      },
      {
        title: "Gas Supply Contracts",
  /*       icon: { icon: "people", pack: "eva" }, */
        data: {
          permission: 'view',
          resource: 'gas-supply-contracts-section'
        },
        children: [
          {
            title: "Physical Swap",
            link: "/swap-contracts",
            data: {
              permission: 'view',
              resource: 'swap-contracts'
            },
          },
          {
            title: "Purchase/Sale",
            link: "/purchase-sale-contract",
            data: {
              permission: 'view',
              resource: 'purchase-sale-contract'
            },
          },
       /*    {
            title: "Comparison",
            link: "/physical-contracts-comparison",
            data: {
              permission: 'view',
              resource: 'physical-contracts-comparison'
            },
          }, */
        ],
      },
     
    ],
  },

 

  {
    title: "Consumption",
    icon: { icon: "chart-line", pack: "fas" },
    data: {
      permission: 'view',
      resource: 'consumption-management-section'
    },
    children: [
      {
        title: "Consumption forecast",
        link: "/demand-curves",
        data: {
          permission: 'view',
          resource: 'demand-curves'
        },
      },
      {
        title: "Consumption comparison",
        link: "/consumption",
        data: {
          permission: 'view',
          resource: 'consumption'
        },
      },

    ],
  },

  {
    title: "Tanker Trucks",
    icon: { icon: "truck", pack: "fas" },
    data: {
      permission: 'view',
      resource: 'tanker-truck-management-section'
    },
    children: [
      {
        title: "Requests (Single-Client)",
        link: "/request-single-clients",
        data: {
          permission: 'view',
          resource: 'request-single-clients'
        },
      },
      {
        title: "Order Management",
        link: "/orders-management",
        data: {
          permission: 'view',
          resource: 'orders-management'
        },
      },


 
    ],
  },

 
 
  {
    title: "Master Data",

    icon: { icon: "database", pack: "fas" },
    data: {
      permission: 'view',
      resource: 'master-data-section'
    },
    children: [
      {
        title: "Balancing Zone Set Up",
 /*        icon: { icon: "map", pack: "fas" }, */
        data: {
          permission: 'view',
          resource: 'balancing-zone-set-up-section'
        },
        children: [
          {
            title: "Balancing Zones",
       
            link: "/master-data/balancing-zones",
            data: {
              permission: 'view',
              resource: 'balancing-zones'
            },
          },
          {
            title: "Balancing Rules",
    
            link: "/master-data/balancing-rules",
            data: {
              permission: 'view',
              resource: 'balancing-rules'
            },
          },
          {
            title: "Infrastructures",
    
            data: {
              permission: 'view',
              resource: 'infrastructures-section'
            },
            children: [
              {
                title: "Virtual Balancing Points",
                link: "/master-data/logistic-elements/balancing-points",
                data: {
                  permission: 'view',
                  resource: 'balancing-points'
                },
              },
              {
                title: "LNG Tanks",
                link: "/master-data/logistic-elements/LNG-tanks",
                data: {
                  permission: 'view',
                  resource: 'LNG-tanks'
                },
              },
              {
                title: "Underground Storages",
                link: "/master-data/logistic-elements/underground-storages",
                data: {
                  permission: 'view',
                  resource: 'underground-storages'
                },
              },
              {
                title: "Regasification Plants",
                link: "/master-data/logistic-elements/regasification-plants",
                data: {
                  permission: 'view',
                  resource: 'regasification-plants'
                },
              },
              {
                title: "Satellite Plants",
                link: "/master-data/logistic-elements/satellite-plants",
                data: {
                  permission: 'view',
                  resource: 'satellite-plants'
                },
              },
              {
                title: "Overseas Trading Points",
                link: "/master-data/logistic-elements/overseas-trading-point",
                data: {
                  permission: 'view',
                  resource: 'overseas-trading-point'
                },
              },
              {
                title: "Connection points",
         
                link: "/master-data/logistic-elements/connection-points",
                data: {
                  permission: 'view',
                  resource: 'connection-points'
                },
              }
            ],
          },
         
        ],
      },
     {
      title: "Others",
      /*        icon: { icon: "map", pack: "fas" }, */
             data: {
               permission: 'view',
               resource: 'others-section'
             },
      children:[
        {
          title: "Countries",
    
          link: "/master-data/countries",
          data: {
            permission: 'view',
            resource: 'countries'
          },
        },
        {
          title: "Legal Entities",
    
          link: "/master-data/legal-entities",
          data: {
            permission: 'view',
            resource: 'legal-entities'
          },
        },
        {
          title: "Supply areas and points",
  
          link: "/master-data/supply-points-and-supply-areas",
          data: {
            permission: 'view',
            resource: 'supply-points-and-supply-areas'
          },
        },
        {
          title: "Services",
     
          link: "/master-data/services",
          data: {
            permission: 'view',
            resource: 'services'
          },
        },
        {
          title: "Toll Types",
   
          link: "/master-data/tolls-types",
          data: {
            permission: 'view',
            resource: 'tolls-types'
          },
        },
        {
          title: "Currencies",
       
          link: "/master-data/currencies",
          data: {
            permission: 'view',
            resource: 'currencies'
          },
        },
        {
          title: "Vessels",
    
          link: "/master-data/vessels",
          data: {
            permission: 'view',
            resource: 'vessels'
          },
        },
        {
          title: "Sources",
       
          link: "/master-data/sources",
          data: {
            permission: 'view',
            resource: 'sources'
          },
        },

      ]
     },
    ],
  },

    

  {
    title: "More",
    data: {
      permission: 'view',
      resource: 'more-section'
    },
    children: [  
    {
      title: "Prices",
      link: "/imbalance-prices",
      data: {
        permission: 'view',
        resource: 'imbalance-prices'
      },
    },
     {
      title: "Logistics Costs",
      link: "/logistics-costs",
      data: {
        permission: 'view',
        resource: 'logistics-costs'
      },
    },
    {
      title: "Optimization",
      link: "/optimization",
      data: {
        permission: 'view',
        resource: 'optimization'
      },
    }, 
    {
      title: "Audit Logs",
  /*     icon: { icon: "search", pack: "fas" }, */
      link: "/audit-logs",
      data: {
        permission: 'view',
        resource: 'audit-logs'
      },
    },
    {
      title: "Workflows",
      //icon: { icon: "file-alt", pack: "fas" },
      data: {
        permission: 'view',
        resource: 'workflow-section'
      },
      children: [
        {
          title: "Workflows",
          link: "/workflows",
          data: {
            permission: 'view',
            resource: 'workflows'
          },
        },
        {
          title: "Workflow Logs",
          link: "/workflow-logs",
          data: {
            permission: 'view',
            resource: 'workflow-logs'
          },
        },
      ],
    },
    {
      title: "Reporting",
/*       icon: { icon: "layout", pack: "eva" }, */
      data: {
        permission: 'view',
        resource: 'reporting-section'
      },
      children: [
        {
          title: "Reports",
          link: "/report",
          data: {
            permission: 'view',
            resource: 'report'
          },
        },
        {
          title: "Charts",
          link: "/charts-reporting",
          data: {
            permission: 'view',
            resource: 'charts-reporting'
          },
        },
      ],
    } ]
  },




 
];