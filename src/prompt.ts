// @ts-nocheck
import enquirer from "enquirer";

async function confirm(message: string, initial: boolean = true) {
  const { promptValue } = await enquirer.prompt({
    type: "confirm",
    name: "promptValue",
    message: message,
    initial,
  });
  return promptValue;
}

async function input(message: string, initial?: string = '') {
  const inputValue = await enquirer.input({
    message: message,
    initial,
  });
  return inputValue;
}

async function select(
  choices: string[],
  config?: {
    result?: (value: any) => any;
    message?: string;
    [o: string]: any;
  } = {
    message: "请选择操作",
  }
) {
  const selectValue = await enquirer.select({
    choices,
    ...config,
  });
  return selectValue;
}

async function form(
  message:string,
  choices:{
    name:string,
    message:string,
    initial?:string
  }[]
) {
  const formValue = await enquirer.form({
    name:'user',
    message,
    choices,
  });
  return formValue;
}

export default {
  confirm,
  input,
  form,
  select,
};
