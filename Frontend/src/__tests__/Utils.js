import { formatDate } from "../app/format"

describe("Utils function get", () => { 
test("formadate should betransform into", () => {
    const mock = [
        {
            key: "2003-03-03",
            answer: "3 Mar. 03"
        },
        {
            key: "2025-12-22",
            answer: "22 Déc. 25"
        },
        {
            key: "2025-09-29T22:00:00.000+0000",
            answer: "30 Sep. 25"
        },
        {
            key: "30 Septembre 2025",
            answer: "30 Sep. 25"
        }
    ]

    mock.forEach((el) => {
        const formaDate = formatDate(el.key)
        expect(formaDate).toBe(el.answer)
       
    })
  })
})