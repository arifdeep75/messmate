
export interface Member {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  profileImage: string;
  previousBalance: number;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}



export interface Meal {
  _id?: string;
  memberId: string;
  memberName: string;
  date: string;
  lunch: boolean;
  dinner: boolean;
  updatedAt: Date;
  updatedBy: string;
}
