export interface Record {
  id: number;
  children: Record[];
}

export const FIXTURE: Record = {
  id: 0,
  children: [
    {
      id: 1,
      children: [
        {
          id: 2,
          children: [
            {
              id: 3,
              children: [],
            },
          ],
        },
        {
          id: 4,
          children: [
            {
              id: 5,
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 6,
      children: [
        {
          id: 7,
          children: [],
        },
      ],
    },
  ],
};
