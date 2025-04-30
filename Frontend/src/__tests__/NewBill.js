/**
 * @jest-environment jsdom
 */
global.alert = jest.fn(); // doit etre defini avec les imports

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";
import FormData from "../containers/NewBill.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
 
    test("Then handleSubmit should be called with data and navigate to Bills", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      });
 Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
          
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });

      const handleSubmit = jest.spyOn(newBill, "handleSubmit");  // fonction handleSubmit espionné sans avoir été declancher
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);

      const Bill = {
        type: "Transports",
        name: "Vol Paris-Brest",
        date: "2024-02-10",
        amount: 42,
        vat: "10",
        pct: 15,
        commentary: "test bill",
        status: "pending",
        fileName: "image.jpg",
      }
      
      screen.getByTestId("expense-type").value = Bill.type;
      screen.getByTestId("expense-name").value = Bill.name;
      screen.getByTestId("amount").value = Bill.amount;
      screen.getByTestId("datepicker").value = Bill.date;
      screen.getByTestId("vat").value = Bill.vat;
      screen.getByTestId("pct").value = Bill.pct;
      screen.getByTestId("commentary").value = Bill.commentary;

      newBill.fileName = Bill.fileName
      newBill.updateBill = jest.fn()

      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']); // verifie que le call de la fonction ce fait bien et qu'elle nous redirige bien vers Bills
    });
  });
  describe("When i change file", () => {
  test("Then handleChangeFile should create a new formData", async () => {
    const html = NewBillUI()
    document.body.innerHTML = html

    const onNavigate = jest.fn((pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    });

  Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage
    });
 

  const file = new File(['image'], 'image.png', {type: 'image/png'});
  const handleChangeFile = jest.fn((e) =>newBill.handleChangeFile(e));
  const billFile = screen.getByTestId('file');
  billFile.addEventListener("change", handleChangeFile);     
  userEvent.upload(billFile, file)
  
  
  expect(billFile.files[0].name).toBeDefined()
  expect(handleChangeFile).toBeCalled()

  const event = { preventDefault: jest.fn(), target: { value: 'C:\\fakepath\\test.jpg' } };
  newBill.handleChangeFile(event);
  
  await Promise.resolve(); // assure que le .then() est exécuté


  expect(newBill.fileUrl).toBe('https://localhost:3456/images/test.jpg');
  expect(newBill.billId).toBe('1234');
  expect(newBill.fileName).toBe('test.jpg');

  });

  test("If the file is not a jpg, png or jpeg then error message", async () => {
    const html = NewBillUI()
    document.body.innerHTML = html

    const onNavigate = jest.fn((pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    });

  Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
         
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage
    });
    
  const badFile = new File(["pdf"], "document.pdf", { type: "application/pdf" });
  const fileInput = screen.getByTestId("file");
  // beforeEach(() => {
    window.alert = jest.fn();
  // });
  fireEvent.change(fileInput, {
    target: {
      files: [badFile]
    }
  });
 
  expect(window.alert).toHaveBeenCalledWith("Veuillez choisir un format d'image jpg , jpeg ou png");

  });
 });


describe("When an error occurs on API", () => {
  // Teste le comportement de l'application lorsqu'une erreur 404 survient au niveau de l'API
  test("Then it should display a 404 message error", async () => {
    const html = NewBillUI()
    document.body.innerHTML = html

    const onNavigate = jest.fn((pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    });

  Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
         
        const error404 = new Error("Erreur 404");

        const newBill = new NewBill({
          document,
          onNavigate,
          store: {                              
            bills: () => ({
              update: () => Promise.reject(error404),
            }),
          },
          localStorage: window.localStorage,
        });
    // Simule un comportement d'erreur lors de l'appel à l'API
    
    console.error = jest.fn();

    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn(newBill.handleSubmit.bind(newBill));
    form.addEventListener("submit", handleSubmit);
    fireEvent.submit(form);
    
    await waitFor(() => new Promise(process.nextTick)); // Attente que le processus se termine avant de vérifier les erreurs
    expect(console.error).toHaveBeenCalledWith(error404);
  });
});
});
describe("When an error occurs on API", () => {
  // Teste le comportement de l'application lorsqu'une erreur 404 survient au niveau de l'API
  test("Then it should display a 500 message error", async () => {
    const html = NewBillUI()
    document.body.innerHTML = html

    const onNavigate = jest.fn((pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    });

  Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
         
        const error500= new Error("Erreur 500");

        const newBill = new NewBill({
          document,
          onNavigate,
          store: {                              
            bills: () => ({
              update: () => Promise.reject(error500),
            }),
          },
          localStorage: window.localStorage,
        });
    // Simule un comportement d'erreur lors de l'appel à l'API
    
    console.error = jest.fn();

    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn(newBill.handleSubmit.bind(newBill));
    form.addEventListener("submit", handleSubmit);
    fireEvent.submit(form);
    
    await waitFor(() => new Promise(process.nextTick)); // Attente que le processus se termine avant de vérifier les erreurs
    expect(console.error).toHaveBeenCalledWith(error500);
  });
});
