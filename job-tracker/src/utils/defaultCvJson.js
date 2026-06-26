export const DEFAULT_JSON_TEMPLATE = JSON.stringify(
  {
    basics: {
      name: "",
      email: "",
      phone: "",
      location: "",
      links: []
    },
    sections: [
      {
        title: "Education",
        type: "DetailedList",
        items: []
      },
      {
        title: "Experience",
        type: "DetailedList",
        items: []
      },
      {
        title: "Projects",
        type: "ProjectList",
        items: []
      },
      {
        title: "Technical Skills",
        type: "TagsList",
        items: []
      }
    ]
  },
  null,
  2
);
