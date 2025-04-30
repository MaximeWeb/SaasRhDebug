/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import { formatStatus } from "../app/format.js";
import { formatDate } from "../app/format";


global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve([]),
  })
);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy(); // l'icon contient bien la classe active icon
    });

    test("Then bills should be ordered from latest to earlest", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsContainers = new Bills({
        document,
        store: mockStore,
      });
      const res = await billsContainers.getBills(); // on va recuperer les data du mockstore et les utilisé dans notre function utilisé dans l'application
      const appSortedFunction = res.map((item) => item.id); // on va comparé si les id ressortent dans le meme ordre

      const mockBillsSorted = await mockStore.bills().list(); // et on repprend le meme shema manuelement afin de comparer avec expect
      mockBillsSorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      const testSortedMockStore = mockBillsSorted.map((item) => item.id);

      expect(appSortedFunction).toEqual(testSortedMockStore);
    });

    test("formadate should betransform into", () => {
      const mock = [
        {
          key: "2003-03-03",
          answer: "3 Mar. 03",
        },
        {
          key: "2025-12-22",
          answer: "22 Déc. 25",
        },
        {
          key: "2025-09-29T22:00:00.000+0000",
          answer: "30 Sep. 25",
        },
        {
          key: "30 Septembre 2025",
          answer: "30 Sep. 25",
        },
      ];

      mock.forEach((el) => {
        const formaDate = formatDate(el.key);
        expect(formaDate).toBe(el.answer);
      });
    });
    test("if for some reason, corrupted data was introduced, we manage here failing formatDate functions", async () => {
      // Mock de `bills()` avec des données contenant une date invalide
      mockStore.bills = jest.fn(() => ({
        list: jest.fn(() =>
          Promise.resolve([
            { id: "1", date: "2004-04-04", status: "pending" }, // Date valide
            { id: "2", date: "invalid-date", status: "accepted" }, // Date invalide
          ])
        ),
      }));

      const billsContainer = new Bills({
        document,
        store: mockStore,
      });

      const bills = await billsContainer.getBills();

      expect(bills[0].date).toBe("4 Avr. 04");
      expect(bills[1].date).toBe("invalid-date");
      expect(bills[0].status).toBe("En attente");
      expect(bills[1].status).toBe("Accepté");
    });
  });

  describe("When I click on the icon eye", () => {
    test("A modal should open", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      document.body.innerHTML = BillsUI({ data: bills });

      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      });

      const store = null;
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const iconEyes = screen.getAllByTestId("icon-eye");
      const handleClickIconEye = jest.spyOn(
        billsContainer,
        "handleClickIconEye"
      );

      iconEyes.forEach((icon) => {
        icon.addEventListener("click", () =>
          billsContainer.handleClickIconEye(icon)
        );
      });
      $.fn.modal = function (action) {
        if (action === "show") {
          this.addClass("show"); // Ajoute la classe show pour que Jest puisse la voir
        }
        return this;
      };
      userEvent.click(iconEyes[0]); // clique sur le premier icon
     

      await waitFor(() => {
        const modale = document.getElementById("modaleFile");
        expect(modale.classList).toContain("show"); // On vérifié que la modale contient bien la classe show 

        const img = modale.querySelector("img");  // Qu'il ya une balise img et un url et un width
        expect(img).toBeTruthy();
        expect(img.getAttribute("src")).toBe(
          iconEyes[0].getAttribute("data-bill-url")
        );
        expect(img.getAttribute("width")).toBeTruthy();
      });
    });
  });

  describe("When I click on newBills", () => {
    test("Then we should navigate to the new bill route", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = BillsUI({ data: bills });

      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      });

      const store = null;
      const billsContainer = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const buttonNewBill = screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);

      buttonNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(buttonNewBill);

      expect(handleClickNewBill).toHaveBeenCalled();

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });

  // test d'intégration GET
  test("fetches bills from mock API GET", async () => { // on va verifier que les element censé etre visible sont bien présent 
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    document.body.innerHTML = BillsUI({ data: bills });
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.Bills);
    const header = screen.getByText("Mes notes de frais"); // texte
    expect(header).toBeTruthy();
    const billsBody = screen.getByTestId("tbody");  // le tbody
    expect(billsBody).toBeTruthy();

    const rows = screen.getAllByTestId("tr");  // il y'a bien 4 bills dans mon environnement
    // console.log("test max",row.childNodes)
    expect(rows.length).toEqual(4);

    const everyTypeDefined = bills.every(
      (bill) => bill.type !== undefined && bill.type !== ""   // on verifie que les bills on bien des champs true
    );
    expect(everyTypeDefined).toBe(true);

    rows.forEach((row) => {
      const cell = row.querySelectorAll("td")[1];
      const text = cell.textContent.trim();  
// console.log(cell)
console.log(text)
      
      expect(text).not.toBe("");
      expect(text).not.toBe("undefined");
    });
    const buttonNewBills = screen.getByTestId("btn-new-bill");
    expect(buttonNewBills).toBeTruthy();
  });
  describe("When an error occurs on API", () => {
    // Teste le comportement de l'application lorsqu'une erreur 404 survient au niveau de l'API
    test("Then it should display a 404 message error", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = BillsUI({ data: bills });

      const error404 = new Error("Erreur 404");

      const newBill = new Bills({
        document,
        store: {
          bills: () => ({
            list: () => Promise.reject(error404),
          }),
        },
        localStorage: window.localStorage,
      });

      console.error = jest.fn();

    await newBill.getBills();
     

      await waitFor(() => new Promise(process.nextTick));
      expect(console.error).toHaveBeenCalledWith(error404);
    });
  });
  describe("When an error occurs on API", () => {
    // Teste le comportement de l'application lorsqu'une erreur 500 survient au niveau de l'API
    test("Then it should display a 500 message error", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = BillsUI({ data: bills });

      const error500 = new Error("Erreur 500");

      const newBill = new Bills({
        document,
        store: {
          bills: () => ({
            list: () => Promise.reject(error500),
          }),
        },
        localStorage: window.localStorage,
      });

      console.error = jest.fn();

       await newBill.getBills();
     

      await waitFor(() => new Promise(process.nextTick));
      expect(console.error).toHaveBeenCalledWith(error500);
    });
  });
});
