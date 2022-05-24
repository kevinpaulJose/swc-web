import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { firedb } from "./config";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
  uploadString,
} from "firebase/storage";

export const getSetTime = async () => {
  const timeRef = collection(firedb, "startDate");
  const querySnapshot = await getDocs(timeRef);
  let retData = new Date();
  querySnapshot.forEach((doc) => {
    retData = doc.data().date.toDate();
  });
  return retData;
};

export const setData = async (data) => {
  console.log(data);
  const batch = writeBatch(firedb);
  //   let ref = doc(firedb, "users", "UOs7yF0lLu7KuNxSrFFZ");
  let ref = [];
  data.forEach((value, index) => {
    const tempRef = doc(
      firedb,
      "users",
      new Date().getTime().toString() + index.toString()
    );
    ref.push(tempRef);
  });

  data.forEach((value, index) => {
    batch.set(ref[index], value);
  });
  try {
    await batch.commit();
    return true;
  } catch (e) {
    return false;
  }
};
