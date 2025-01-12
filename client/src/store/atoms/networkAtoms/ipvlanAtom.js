import { atom, atomFamily } from "recoil";

export const ipvlanAtom = atomFamily({
    key:"ipvlanAtom",
    default:{
        mode:"",
        pairs:[], // {subnet:"", gateway:""}
        parent:"",
        name:""
    }
})