import {
  // addDoc,
  collection,
  doc,
  getDocs,
  // limit,
  orderBy,
  query,
  setDoc,
  // Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { firedb } from "./config";

export const getSetTime = async () => {
  const timeRef = collection(firedb, "startDate");
  const querySnapshot = await getDocs(timeRef);
  let retData = new Date();
  querySnapshot.forEach((doc) => {
    retData = doc.data().date.toDate();
  });
  return retData;
};

export const getUsersByGroup = async (group) => {
  const usersRef = collection(firedb, "users");
  const q = query(usersRef, where("group", "==", group), orderBy("id"));
  const querySnapshot = await getDocs(q);
  let retData = [];
  querySnapshot.forEach((doc) => {
    retData.push(doc.data());
  });
  return retData;
};
export const getUsersById = async (id) => {
  const usersRef = collection(firedb, "users");
  const q = query(usersRef, where("id", "==", parseInt(id)));
  const querySnapshot = await getDocs(q);
  let retData = [];
  querySnapshot.forEach((doc) => {
    retData.push(doc.data());
  });
  return retData;
};

export const getPriceByWeek = async (week) => {
  const pricesRef = collection(firedb, "prices");
  const q = query(pricesRef, where("week", "==", week));
  const querySnapshot = await getDocs(q);
  let retData = [];
  querySnapshot.forEach((doc) => {
    retData.push(doc.data());
  });
  return retData;
};

export const setData = async (data, col) => {
  // console.log(data);
  const batch = writeBatch(firedb);
  let ref = [];
  data.forEach((value, index) => {
    const tempRef = doc(
      firedb,
      col,
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

export const setPrice = async (col, priceData, priceId) => {
  await setDoc(doc(firedb, col, new Date().getTime().toString()), priceData);
  const batch = writeBatch(firedb);

  const usersRef = collection(firedb, "users");

  const q = query(usersRef, where("id", "==", priceId));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docs) => {
    const tempRef = doc(firedb, "users", docs.id);
    // console.log(docs.id);
    batch.delete(tempRef);
  });

  try {
    await batch.commit();
    return true;
  } catch (e) {
    return false;
  }
};

export const removeData = async (data, group, col) => {
  await setData(data, col);
  const batch = writeBatch(firedb);
  const id = [];
  data.forEach((value, index) => {
    id.push(value.id);
  });
  const usersRef = collection(firedb, "users");

  let arrays = [],
    size = 10;

  while (id.length > 0) arrays.push(id.splice(0, size));
  for (const item of arrays) {
    const q = query(
      usersRef,
      where("group", "==", group),
      where("id", "in", item)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docs) => {
      const tempRef = doc(firedb, "users", docs.id);
      // console.log(docs.id);
      batch.delete(tempRef);
    });
  }
  try {
    await batch.commit();
    return true;
  } catch (e) {
    return false;
  }
};

export const updateData = async (data, group) => {
  const batch = writeBatch(firedb);
  const id = [];
  data.forEach((value, index) => {
    id.push(value.id);
  });
  const usersRef = collection(firedb, "users");

  let arrays = [],
    size = 10;

  while (id.length > 0) arrays.push(id.splice(0, size));
  console.log(arrays);
  for (const item of arrays) {
    const q = query(
      usersRef,
      where("group", "==", group),
      where("id", "in", item)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docs) => {
      const tempRef = doc(firedb, "users", docs.id);
      console.log(docs.id);
      batch.update(tempRef, data.filter((v) => v.id === docs.data().id)[0]);
    });
  }
  try {
    await batch.commit().catch((e) => {
      return false;
    });
    return true;
  } catch (e) {
    return false;
  }
};
