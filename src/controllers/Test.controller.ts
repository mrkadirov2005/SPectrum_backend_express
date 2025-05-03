import { Request, Response } from "express";
import Test from "../models/Test.model";
import jwt from "jsonwebtoken";
import Ids from "../models/IDs.model";
import logEvent from "../middlewares/createLogs";
import { log } from "console";

const getAdminUuidFromToken = (req: Request): string | null => {
	const authHeader = req.headers.authorization;
	if (!authHeader) return null;

	const token = authHeader.split(" ")[1];
	// console.log("her eis the token",token)
	console.log("JWT_SECRET:", process.env.JWT_SECRET);

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "my_super_secret_key") as { uuid?: string };
		console.log("Decoded token", decoded);
		return decoded.uuid || null;
	} catch {
		console.error("Invalid token:", token);
		return null;
	}
};
// CREATE A TEST (Only by Client, Staff, Admin)
export const createTest = async (req: Request, res: Response) => {
	const adminUUID = getAdminUuidFromToken(req);
	if (!adminUUID) {
		res.status(500).json({ message: "No admin Token provided" });
		return;
	}

	try {
		// Extract the JWT token from headers
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			res.status(401).json({ message: "Unauthorized: No token provided" });
			return;
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as { role?: string; uuid?: string };

		// Check if the user has a valid role (Client, Staff, Admin)
		if (!decoded.role || !["Client", "Staff", "Admin"].includes(decoded.role)) {
			res.status(403).json({ message: "Forbidden: You do not have permission to create a test" });
			return;
		}

		// Extract test details from request body
		const { title, subject, test_start_password, duration, start_date, end_date, questions,uuid } = req.body;

		// Validate required fields
		if (!title || !subject || !test_start_password || !duration || !start_date || !end_date || !questions || !uuid) {
			res.status(400).json({ message: "All fields are required" });
			return;
		}

		// Create a new test document
		const newTest = new Test({
			title,
			subject,
			test_start_password,
			duration,
			start_date,
			end_date,
			createdBy: adminUUID,
			questions,
			isActive: true, // default active
			uuid: uuid,
		});

		// Save the new test in the database
		await newTest.save();
		logEvent(adminUUID, `Test with title ${title} created by ${adminUUID},test Id is ${newTest._id}`);
		res.status(201).json(newTest);
		return;
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
		return;
	}
};

// GET ALL TESTS
export const getTests = async (_req: Request, res: Response) => {
	const createdId = getAdminUuidFromToken(_req);
	if (!createdId) {
		res.status(500).json({ message: "No admin Token provided" });
		return;
	}
	try {
		const foundId = await Ids.findOne({ uuid: createdId });
		if (!foundId) {
			res.status(500).json({ message: "You are not a memmber of Spectrum Academy" });
			return;
		}
		if (foundId.role !== "Admin" && foundId.role !== "Client") {
			res.status(500).json({ message: "You are not an admin" });
			return;
		}
	} catch (error) {
		res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
		return;
	}
	try {
		const tests = await Test.find();
		res.status(200).json(tests);
		return;
	} catch (error) {
		res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
		return;
	}
};

// GET TEST BY UUID
export const getTestByUuid = async (req: Request, res: Response) => {
	const createdId = getAdminUuidFromToken(req);
	if (!createdId) {
		res.status(500).json({ message: "No admin Token provided" });
		return;
	}

	try {
		const test = await Test.findOne({ uuid: req.body.uuid });
		if (!test) {
			res.status(404).json({ message: "Test not found" });
			return;
		}

		const foundId = await Ids.findOne({ uuid: createdId });
		if (!foundId) {
			res.status(500).json({ message: "You are not a memmber of Spectrum Academy" });
			return;
		}
		res.status(200).json(test);
		return;
	} catch (error) {
		res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
		return;
	}
};

// UPDATE A TEST
export const updateTest = async (req: Request, res: Response) => {
	const adminUUID = getAdminUuidFromToken(req);
	if (!adminUUID) {
		res.status(500).json({ message: "No admin Token provided" });
		return;
	}
	if (req.body.uuid !== adminUUID) {
		res.status(500).json({ message: "You are not allowed to update this test" });
		return;
	}
	try {
		const test = await Test.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true });
		if (!test) {
			res.status(404).json({ message: "Test not found" });
			return;
		}
		logEvent(adminUUID, `Test with title ${test.title} updated by ${adminUUID},test Id is ${test._id}`);
		res.status(200).json(test);
		return;
	} catch (error) {
		res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
		return;
	}
};

// DELETE A TEST
export const deleteTest = async (req: Request, res: Response) => {
	const adminUUID = getAdminUuidFromToken(req);
	try {
		const test = await Test.findOne({ uuid: req.body.uuid });
		if (!test) {
			res.status(404).json({ message: "Test not found" });
			return;
		}
		if (test.createdBy !== adminUUID) {
			res.status(500).json({ message: "You are not allowed to delete this test" });
			return;
		}
		const isDeleted=await Test.findOneAndDelete({ uuid: req.body.uuid });
    if (!isDeleted) {
      res.status(500).json({ message: "Test not deleted" });
      console.log(isDeleted)
      return;
    }
    logEvent(adminUUID, `Test with title ${test.title} deleted by ${adminUUID},test Id is ${test._id}`);
		res.status(200).json({ message: "Test deleted successfully" });
		return;
	} catch (error) {
		res.status(500).json({ message: error instanceof Error ? error.message : "Unknown error" });
		return;
	}
};
