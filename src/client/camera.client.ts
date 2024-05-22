import { ContextActionService, Players, RunService, UserInputService, Workspace } from "@rbxts/services";

// Adapted from https://devforum.roblox.com/t/help-making-camera-follow-mouse/2188908/11
const camera = Workspace.CurrentCamera!;
let cameraHeading = 0; // Camera heading
let cameraFocus = 50; // Distance away from the ship the camera will focus on
let rawCameraFocus = 0; // Mouse Y-input
let cameraDistance = 25; // Distance away from the ship the camera will be
let cameraHeight = 10; // Height of the camera
const cameraHeightRatio = cameraDistance / cameraHeight; // Ratio of camera distance to height
const player = Players.LocalPlayer!;

// Camera Formula Constants
const CAMERA_BASE = 5;
const CAMERA_MOD = 0.01;
const CAMERA_BUMP = 15;

player.CharacterAdded.Connect((character) => {
    const humanoid = character.WaitForChild("Humanoid") as Humanoid;
    const rootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

    function playerInput(actionName: string, inputState: Enum.UserInputState, inputObject: InputObject) {
        // Calculate camera/player rotation on input change
        if (inputState === Enum.UserInputState.Change) {
            cameraHeading = cameraHeading + inputObject.Delta.X * 0.5;
            rawCameraFocus = math.clamp(rawCameraFocus - inputObject.Delta.Y, 0, 450);
            cameraFocus = math.pow(CAMERA_BASE, 1 + rawCameraFocus * CAMERA_MOD) + CAMERA_BUMP;
        }
    }

    function scrollInput(actionName: string, inputState: Enum.UserInputState, inputObject: InputObject) {
        cameraDistance = math.clamp(cameraDistance - inputObject.Position.Z, 20, 50);
        cameraHeight = cameraDistance / cameraHeightRatio;
        print(inputObject.Delta.Z);
    }

    function updateCamera() {
        // Calculate camera position
        const cameraX = rootPart.Position.X - cameraDistance * math.cos(math.rad(cameraHeading));
        const cameraZ = rootPart.Position.Z - cameraDistance * math.sin(math.rad(cameraHeading));
        // Calculate point camera is focusing on
        const cameraFocusX = rootPart.Position.X + cameraFocus * math.cos(math.rad(cameraHeading));
        const cameraFocusZ = rootPart.Position.Z + cameraFocus * math.sin(math.rad(cameraHeading));
        // Move camera
        camera.CFrame = CFrame.lookAt(
            new Vector3(cameraX, rootPart.Position.Y + cameraHeight, cameraZ),
            new Vector3(rootPart.Position.X + cameraFocusX, 28.2, rootPart.Position.Z + cameraFocusZ),
        );
    }

    ContextActionService.BindAction("PlayerInput", playerInput, false, Enum.UserInputType.MouseMovement);
    ContextActionService.BindAction("ScrollInput", scrollInput, false, Enum.UserInputType.MouseWheel);

    camera.CameraType = Enum.CameraType.Scriptable;
    UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
    UserInputService.MouseIconEnabled = false;

    RunService.BindToRenderStep("CameraUpdate", Enum.RenderPriority.Camera.Value + 1, () => {
        UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
        UserInputService.MouseIconEnabled = false;
        updateCamera();
    });
});
