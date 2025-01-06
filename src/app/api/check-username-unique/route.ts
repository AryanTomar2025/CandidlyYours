import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

// localhost:3000/api/cuu?username=aryan?phone=android

export async function GET(request: Request) {
  await dbConnect();

  if(request.method!=='GET'){
    return Response.json({
      success:false,
      message:"Method not allowed",
    },{
      status:405
    })
  }

  try {

    const {searchParams} = new URL(request.url)
    const queryParam = {
        username:searchParams.get('username')
    }

    const result = UsernameQuerySchema.safeParse(queryParam)
    
    if(!result.success){
        const usernameErrors = result.error.format().username?._errors || []
        return Response.json({
            success:false,
            message:usernameErrors?.length > 0
            ? usernameErrors.join(', ')
            : 'Invalid query parameters',
        },
        {
            status:400
        })
    }

    const {username} = result.data;

    const existingVerifiedUser = await UserModel.find({username,isVerified:true})

    if(existingVerifiedUser){
        return Response.json({
            success:false,
            message:"Username is already taken",
        },{
            status:400
        })
    }

    return Response.json({
        success:true,
        message:"Username is correct",
    },{
        status:400
    })

  } catch (error) {
    console.log("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      {
        status: 500,
      }
    );
  }
}
