import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: "quick-run-c74ff",
      client_email: "firebase-adminsdk-fbsvc@quick-run-c74ff.iam.gserviceaccount.com",
      private_key: `-----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDDfw745KwRC1pV
hVHnNkDVOX7/97t3No6SZwRR0yIpn6yLSl8i+9GGt9LSNOGu0a9VJB77NgO9yPYS
rGtQKyOUYMGsTkaCVFd53F9NTmaMlDYTywtOgPOK3eiSdZIsonZMxVyx3YOg2fds
rUgh9TS9dMQCwbg2bvbbYVAXs9rIw/tsxY/N6FbfYdJRJFkZyetXm4aqRabAbDzz
O8J744o/GN2EUvq7C72CbAgHm0ZEyrLEOJGCCAej+56Ao4XbQv7pVWo7EDLa1xu5
9C2i6hWs89kjv3q8iOI1DK0GQb0xUyDNv/urPYUtoI4/jB35SRSbyGwRiuPmOivD
b+qK3MclAgMBAAECgf9Q8ktAw257oDfHMWy4T76Ii0YKtojo06408HLZbpK2qWbI
RgMeeSZIodSpNTw9JpVyq4IogjUKYCuDj+DfUP1qcqW+sqp/TGzsCFNtrwjHLJc3
mtsTplExLrEd85CS6rIRF6dJ/m6CK75HQXiclus/hxmiCpQ79bZBIAoJxm7QsZva
LHI0L3SBnD/HiXWEPlgo2JpAywjH7kG97TnqKjqCk669k3qT0471qQIzW1Pp7cHi
ndYwC+bmYpa8RiZ2xC4hbq/Ete8jE/sKDPnNtsIEoNnE06unYfdt8mZPOTHOvZZ0J
Iv4vdew43gEmDaoYcYLmJIfczCvET15VVtt6gXkCgYEA7MSRrth/492KEBTmCWZd
u77vupzhe5ezJxQh40wEM51ljLgrLk51YZrycx3pR1dDrxq7rYkVOoOn+FUAijci
obN2/p2q0bkFDTeO/5twjIhwlEz4ojC3iXZLE/hr5dvjkVF987Z+4nQfSuTqKjav
pi5u/UpK6qb6HOxjY2IxrBsCgYEA02BGepzwhKhThOqllZv9bWpTA1wiRFaxv7gE
NoN0um90DtLGqj32onVv/4NhBYUPDcXyMB5UComxKUWq/YC3+TfKX+c8ai5twmo8
NhDLz40Le1+RbHBF/QYazTTGumRKnO5e8XE79Zqdsmj7wxlIRIsqghYnvev5sYM5
9EcwDb8CgYEAzgFiOF1LOToC7Gcil78ngzloYFgroFunlzLfIWN8rGQgfUWo3IuL
ejdVCHBYDqiQzYRXE3CYtebjeSCMbbX3PfZmbLdGb1+qU4upsiDO1pfITGCEXKpC
pynzvRaC2uZtpHzhN/HriKE8sO9oBv656b+w9lVzxaMvL4dGGqzPR00CgYAKecsE
aKLC8FSzUa3DLGfy9EII+Jf6KxHEHqqWyQ0P8FYgJfISnd+LTaavUyOL0nxcgmLu
X5Jqs0hEc192ENsNTuaIuj0URhjKedliFJMFRkg7ZREf/rB5ScQqR2NR+YZ5IJc0
ABioo3ENVoajtK0QOJVyvQZbM0a8tXQ51w1aoQKBgHLx7MGAx9JyttbLpzM8E2OX
vr5KQKV9paYabL/sA5pg8Lyz6hn98VoxcdqHkjpfMO1Oag6qfoPcIutzMCuRKjMA
xre2EK1oD0LL8/uB+9FmuAEu0LBPh1v9/WOEX0sPts8GM+643NYLvQ6g2pkpCYWr
YXR3uHaL/eTeWEAhQVH6
-----END PRIVATE KEY-----`,
    }),
  });
}

export default admin;

//new code notification
export const adminDB = admin.firestore()
export const adminMessaging = admin.messaging()