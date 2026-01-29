export const usersDB = [
  {
    id: 1,
    firstName: "Aditya",
    lastName: "Singh",
    team: "Sales",
    email: "aditya@admin.com",
    password: "123456",
    bills: [
      {
        billId: "B-001",
        createdAt: "2025-01-15",
        items: [
          {
            type: "Battery",
            model: "Battery Pack S-01",
            rating: "2.5kW",
            qty: 1,
            price: 560,
          },
          {
            type: "Solar",
            model: "Solar Panel X-01",
            rating: "0.5kW",
            qty: 2,
            price: 110,
          },
        ],
        subtotal: 780,
        discountPercent: 5,
        total: 741,
        notes: "Payment due in 30 days",
      },
    ]
  },
  {
    id: 2,
    firstName: "Rohan",
    lastName: "Sharma",
    team: "Commissioning",
    email: "rohan@factory.com",
    password: "password",
    bills: []
  }
];

export const deviceTypes = [
  "Drives",
  "Motors",
  "Encoders",
  "Feeders",
  "Welder",
  "Pump",
  "Heater",
  "Solar",
  "Battery"
];

export const deviceRatings = ["0.5kW", "1kW", "2kW", "2.5kW", "3kW"];
export const modelSuffix = ["-01", "-02", "-03"];

export const deviceCatalog = [];

deviceTypes.forEach(type => {
  modelSuffix.forEach(suffix => {
    deviceRatings.forEach(rating => {
      const price = Math.floor(Math.random() * 300 + 200); // 200–500

      deviceCatalog.push({
        id: `${type}${suffix}_${rating}`,
        type,
        model: `${type} ${suffix}`,
        rating,
        price
      });
    });
  });
});

export default {
  usersDB,
  deviceCatalog,
  deviceRatings,
  deviceTypes,
};