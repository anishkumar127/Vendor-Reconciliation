import { RequestHandler } from "express";
import masterMapping from "../../models/mapping/masterFileMapping.model";
import { getUser } from "../../services/auth";
import vendorMapping from "../../models/mapping/vendorFileMapping.model";
import completeMapping from "../../models/mapping/completeDetailsFileMapping.model";

// MASTER FILE MAPPING. POST
export const masterFileMappingController: RequestHandler = async (req, res) => {
  const { data } = req.body;

  if (!data)
    return res.status(404).json({ error: "no data received on server." });
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id }: any = await getUser(token);

  if (!_id) return res.status(401).json({ error: "user not authenticated!" });

  const masterMappedData = await masterMapping.create({
    user: _id,
    ...data,
  });
  return res.status(201).json(masterMappedData);
};

//  MATER FILE PUT MAPPING - UPDATE .
export const masterFileUpdateMappingController: RequestHandler = async (
  req,
  res
) => {
  const { data } = req.body;

  if (!data) {
    return res.status(404).json({ error: "No data received on the server." });
  }

  const token = (req as any)?.token;
  if (!token) {
    return res.status(401).json({ error: "You are not authenticated." });
  }

  const { _id }: any = await getUser(token);

  if (!_id) {
    return res.status(401).json({ error: "User not authenticated!" });
  }

  // Assuming you have a way to identify the record you want to update (e.g., using an ID)
  const recordId = req.params.id; // Replace 'id' with the actual parameter name you use in your route

  if (!recordId) {
    return res.status(400).json({ error: "Record ID not provided." });
  }

  try {
    // Check if the record exists before attempting to update
    const existingRecord = await masterMapping.findById(recordId);
    console.log({ recordId });
    console.log({ existingRecord });

    if (!existingRecord) {
      return res.status(404).json({ error: "Record not found." });
    }

    // Update the existing record with the new data
    const updatedRecord = await masterMapping.findByIdAndUpdate(
      recordId,
      {
        user: _id,
        ...data,
      },
      { new: true }
    );

    return res.status(200).json(updatedRecord);
  } catch (error) {
    console.error("Error updating record:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// MASTER FILE MAPPING . GET

export const masterFileMappedGetDataController: RequestHandler = async (
  req,
  res
) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id }: any = await getUser(token);

  if (!_id) return res.status(401).json({ error: "user not authenticated!" });

  try {
    const mappedData = await masterMapping
      .find({ user: _id })
      .select({ user: 0, __v: 0, updatedAt: 0, createdAt: 0 });

    return res.status(200).json({ data: mappedData });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

//  VENDOR FILE MAPPING.

export const vendorFileMappingController: RequestHandler = async (req, res) => {
  const { data } = req.body;

  if (!data)
    return res.status(404).json({ error: "no data received on server." });
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id }: any = await getUser(token);

  if (!_id) return res.status(401).json({ error: "user not authenticated!" });

  const vendorMappedData = await vendorMapping.create({
    user: _id,
    ...data,
  });
  return res.status(201).json(vendorMappedData);
};

// VENDOR FILE UPDATE - PUT
export const vendorFileUpdateMappingController: RequestHandler = async (
  req,
  res
) => {
  const { data } = req.body;

  if (!data) {
    return res.status(404).json({ error: "No data received on the server." });
  }

  const token = (req as any)?.token;
  if (!token) {
    return res.status(401).json({ error: "You are not authenticated." });
  }

  const { _id }: any = await getUser(token);

  if (!_id) {
    return res.status(401).json({ error: "User not authenticated!" });
  }

  // Assuming you have a way to identify the record you want to update (e.g., using an ID)
  const recordId = req.params.id; // Replace 'id' with the actual parameter name you use in your route

  if (!recordId) {
    return res.status(400).json({ error: "Record ID not provided." });
  }

  try {
    // Check if the record exists before attempting to update
    const existingRecord = await vendorMapping.findById(recordId);
    console.log({ recordId });
    console.log({ existingRecord });

    if (!existingRecord) {
      return res.status(404).json({ error: "Record not found." });
    }

    // Update the existing record with the new data
    const updatedRecord = await vendorMapping.findByIdAndUpdate(
      recordId,
      {
        user: _id,
        ...data,
      },
      { new: true }
    );

    return res.status(200).json(updatedRecord);
  } catch (error) {
    console.error("Error updating record:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// VENDOR FILE MAPPING . GET

export const vendorFileMappedGetDataController: RequestHandler = async (
  req,
  res
) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id }: any = await getUser(token);

  if (!_id) return res.status(401).json({ error: "user not authenticated!" });

  try {
    const mappedData = await vendorMapping
      .find({ user: _id })
      .select({ user: 0, __v: 0, updatedAt: 0, createdAt: 0 });

    return res.status(200).json({ data: mappedData });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

// COMPLETE FILE MAPPING.

export const completeFileMappingController: RequestHandler = async (
  req,
  res
) => {
  const { data } = req.body;

  if (!data)
    return res.status(404).json({ error: "no data received on server." });
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id }: any = await getUser(token);

  if (!_id) return res.status(401).json({ error: "user not authenticated!" });

  const completeMappedData = await completeMapping.create({
    user: _id,
    ...data,
  });
  return res.send(completeMappedData);
};

// COMPLETE FILE UPDATE - PUT
export const completeFileUpdateMappingController: RequestHandler = async (
  req,
  res
) => {
  const { data } = req.body;

  if (!data) {
    return res.status(404).json({ error: "No data received on the server." });
  }

  const token = (req as any)?.token;
  if (!token) {
    return res.status(401).json({ error: "You are not authenticated." });
  }

  const { _id }: any = await getUser(token);

  if (!_id) {
    return res.status(401).json({ error: "User not authenticated!" });
  }

  // Assuming you have a way to identify the record you want to update (e.g., using an ID)
  const recordId = req.params.id; // Replace 'id' with the actual parameter name you use in your route

  if (!recordId) {
    return res.status(400).json({ error: "Record ID not provided." });
  }

  try {
    // Check if the record exists before attempting to update
    const existingRecord = await completeMapping.findById(recordId);
    console.log({ recordId });
    console.log({ existingRecord });

    if (!existingRecord) {
      return res.status(404).json({ error: "Record not found." });
    }

    // Update the existing record with the new data
    const updatedRecord = await completeMapping.findByIdAndUpdate(
      recordId,
      {
        user: _id,
        ...data,
      },
      { new: true }
    );

    return res.status(200).json(updatedRecord);
  } catch (error) {
    console.error("Error updating record:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// COMPLETE FILE MAPPING . GET

export const completeFileMappedGetDataController: RequestHandler = async (
  req,
  res
) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id }: any = await getUser(token);

  if (!_id) return res.status(401).json({ error: "user not authenticated!" });

  try {
    const mappedData = await completeMapping
      .find({ user: _id })
      .select({ user: 0, __v: 0, updatedAt: 0, createdAt: 0 });

    return res.status(200).json({ data: mappedData });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

// <---------------------------- DELETE CONTROLLERS ---------------------->

// <---------------------------- MASTER MAPPING DELETE CONTROLLER ---------------------->

export const deleteMasterMappingController: RequestHandler = async (
  req,
  res
) => {
  const deleteMappingID = req.params.id;

  if (!deleteMappingID)
    return res.status(400).json({ error: "missing id to be delete!" });
  const token = (req as any)?.token;

  if (!token) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  const { _id }: any = await getUser(token);

  if (!_id) {
    return res.status(401).json({ error: "User not authenticated!" });
  }

  try {
    const deletedMapping = await masterMapping.findByIdAndDelete({
      _id: deleteMappingID,
      user: _id,
    });

    if (!deletedMapping) {
      return res.status(404).json({ error: "Mapping not found" });
    }

    return res.status(200).json({ message: "Mapping deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// <---------------------------- VENDOR MAPPING DELETE CONTROLLER ---------------------->
export const deleteVendorMappingController: RequestHandler = async (
  req,
  res
) => {
  const deleteMappingID = req.params.id;
  if (!deleteMappingID)
    return res.status(400).json({ error: "missing id to be delete!" });
  const token = (req as any)?.token;

  if (!token) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  const { _id }: any = await getUser(token);

  if (!_id) {
    return res.status(401).json({ error: "User not authenticated!" });
  }

  try {
    const deletedMapping = await vendorMapping.findByIdAndDelete({
      _id: deleteMappingID,
      user: _id,
    });

    if (!deletedMapping) {
      return res.status(404).json({ error: "Mapping not found" });
    }

    return res.status(200).json({ message: "Mapping deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
// <---------------------------- COMPLETE MAPPING DELETE CONTROLLER ---------------------->
export const deleteCompleteMappingController: RequestHandler = async (
  req,
  res
) => {
  const deleteMappingID = req.params.id;
  if (!deleteMappingID)
    return res.status(400).json({ error: "missing id to be delete!" });
  const token = (req as any)?.token;

  if (!token) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  const { _id }: any = await getUser(token);

  if (!_id) {
    return res.status(401).json({ error: "User not authenticated!" });
  }

  try {
    const deletedMapping = await completeMapping.findByIdAndDelete({
      _id: deleteMappingID,
      user: _id,
    });

    if (!deletedMapping) {
      return res.status(404).json({ error: "Mapping not found" });
    }

    return res.status(200).json({ message: "Mapping deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
