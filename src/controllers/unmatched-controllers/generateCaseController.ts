import { RequestHandler } from "express";
import PCase from "../../models/cases/PCase.model";
import { getUser } from "../../services/auth";
import { RecentIds } from "../../models/mixed/RecentIds.model";
import KCase from "../../models/cases/KCase.model";
import LCase from "../../models/cases/LCase.model";
import MCase from "../../models/cases/MCase.model";
import FCase from "../../models/cases/FCase.model";
import GCase from "../../models/cases/GCase.model";
import ACase from "../../models/cases/ACase.model";
import ICase from "../../models/cases/ICase.model";
import LTwoCase from "../../models/cases/LTwoCase.model";
import MThreeCase from "../../models/cases/MThreeCase.model";
import LFourCase from "../../models/cases/L/LFourCase.model";
import MFiveCase from "../../models/cases/M/MFiveCase.model";
import MFourCase from "../../models/cases/M/MFour.Model";
import MTwoCase from "../../models/cases/MTwoCase.model";
import PTwoCase from "../../models/cases/right/PTwoCase.model";
import KTwoCase from "../../models/cases/right/KTwoCase.model";
import GTwoCase from "../../models/cases/right/GTwoCase.model";
import ITwoCase from "../../models/cases/right/ITwoCase.model";
import LThreeCase from "../../models/cases/right/LThreeCase.model";
import Reco from "../../models/cases/Reco/Reco.model";

//  P ONE CASE

export const getPCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const pCaseReport = await PCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: pCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve PCase report" });
  }
};

//  K ONE CASE

export const getKCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const kCaseReport = await KCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
      // 'Debit Amount(INR)': { $ne: null, $ne: undefined, $ne: "" }
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: kCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve PCase report" });
  }
};

//  G ONE CASE
export const getGCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const gCaseReport = await GCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: gCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve GCase report" });
  }
};

// I ONE CASE

export const getICaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const iCaseReport = await ICase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: iCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve iCase report" });
  }
};

// L ONE CASE

export const getLCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const LCaseReport = await LCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: LCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve LCase report" });
  }
};

// M ONE CASE

export const getMCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const mCaseReport = await MCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: mCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve MCase report" });
  }
};

// L TWO CASE

export const getLTwoCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    const LCaseReport = await LTwoCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: LCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve LCase report" });
  }
};

// M TWO CASE

export const getMTwoCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const mCaseReport = await MTwoCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: mCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve MCase report" });
  }
};

// M3 THREE CASE

export const getMThreeCaseGeneratedReport: RequestHandler = async (
  req,
  res
) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const mCaseReport = await MThreeCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: mCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve MCase report" });
  }
};

// L4 FOUR CASE

export const getLFourCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    const LCaseReport = await LFourCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: LCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve LCase report" });
  }
};

// // M4 FOUR CASE

// export const getMFourCaseGeneratedReport: RequestHandler = async (req, res) => {
//   const token = (req as any)?.token;
//   if (!token)
//     return res.status(401).json({ error: "you are not authenticated" });

//   const { _id, email }: any = await getUser(token);

//   if (!_id || !email)
//     return res.status(401).json({ error: "user not authenticated!" });

//   const recentIds = await RecentIds.findOne({
//     user: _id,
//   });

//   if (!recentIds)
//     return res.status(404).json({ error: "no recent ids present." });

//   try {
//     // const pCaseReport = await PCase.find({ user: _id ,})
//     //   .sort({ createdAt: -1 })
//     //   .limit(1)
//     //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

//     // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
//     const mCaseReport = await MFourCase.find({
//       user: _id,
//       uniqueId: recentIds?.masterId,
//     }).select({
//       updatedAt: 0,
//       createdAt: 0,
//       user: 0,
//       _id: 0,
//       __v: 0,
//       uniqueId: 0,
//     });

//     return res.status(200).json({ data: mCaseReport });
//   } catch (error) {
//     return res.status(500).json({ error: "Failed to retrieve MCase report" });
//   }
// };

// M5 FIVE CASE

export const getMFiveCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const mCaseReport = await MFiveCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: mCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve MCase report" });
  }
};

// F CASE
export const getFCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const fCaseReport = await FCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: fCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve FCase report" });
  }
};

// A CASE

export const getACaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const aCaseReport = await ACase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: aCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve ACase report" });
  }
};

// RIGHT P2 K2 G2 I2 L3 M4

//  P ONE CASE

export const getPTwoCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const pCaseReport = await PTwoCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: pCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve PCase report" });
  }
};

//  K TWO CASE

export const getKTwoCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const kCaseReport = await KTwoCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
      // 'Debit Amount(INR)': { $ne: null, $ne: undefined, $ne: "" }
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: kCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve PCase report" });
  }
};

//  G TWO CASE
export const getGTwoCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const gCaseReport = await GTwoCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: gCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve GCase report" });
  }
};

// I TWO CASE

export const getITwoCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const iCaseReport = await ITwoCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: iCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve iCase report" });
  }
};

// L THREE CASE

export const getLThreeCaseGeneratedReport: RequestHandler = async (
  req,
  res
) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const LCaseReport = await LThreeCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: LCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve LCase report" });
  }
};

// M FOUR CASE

export const getMFourCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const mCaseReport = await MFourCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: mCaseReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve MCase report" });
  }
};

// Reco
export const getRecoGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const RecoReport = await Reco.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: RecoReport });
  } catch (error) {
    return res.status(500).json({ error: "Failed to retrieve MCase report" });
  }
};
