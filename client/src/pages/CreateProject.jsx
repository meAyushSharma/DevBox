import { useRecoilState, useRecoilValue } from "recoil";
import { lazy, memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie";

import { IoInformationCircleOutline } from "react-icons/io5";
import { MdReviews } from "react-icons/md";

import { selectedPackageManagerAtom } from "../store/atoms/libAtoms/selectedPackageManagerAtom";
import { userModeSelector } from "../store/selectors/userModeSelector";
import { getServiceNames } from "../store/selectors/getServiceNames";
import { serviceCountAtom } from "../store/atoms/serviceCountAtom";
import { projectNameAtom } from "../store/atoms/projectNameAtom";

const DockerSearchComponent = lazy(() => import("../components/DockerSearchComponent"));
const PackageManager = lazy(() => import("../components/package_manager/PackageManager"));
const Environments = lazy(() => import("../components/environment/Environments"));
const Configurations = lazy(() => import("../components/Configurations"));
const NetworkConfig = lazy(() => import("../components/netword_config/NetworkConfig"));
const Button = lazy(() => import("../components/common/Button"));
const CreateDockerfile = lazy(() => import("../components/CreateDockerfile"));
const RenderPackageManager = lazy(() => import("../components/package_manager/RenderPackageManager"));
const Command = lazy(() => import("../components/Command"));

import { useWorkerValidName } from "../hooks/useWorkerValidName";
import { useDebounce } from "../hooks/useDebounce";



const CreateProject = memo(({type}) => {

    /* 1. Restriction */
    const navigate = useNavigate();
    const isUserLoggedIn = useRecoilValue(userModeSelector);
    const isGuestLoggedIn = Cookies.get("localAuthToken") === "true"; // local
    useEffect(() => {
        if(!(isGuestLoggedIn || isUserLoggedIn)) navigate("/signup");
    }, [isGuestLoggedIn, navigate, isUserLoggedIn]);

    /* check whether : service or env */
    const [serviceCount, setServiceCount] = useRecoilState(serviceCountAtom);
    const env = type === "env";
    const service = type === "service";
    const whatType = env ? "env" : service ? `service${serviceCount+1}` : -1;

    /* project name */
    const [projName, setProjName] = useRecoilState(projectNameAtom(whatType));
    const debouncedName = useDebounce(projName, 1000);
    const [nameIsValid, setNameIsValid] = useState(null);

    /* check environment (folder) dockerfiles duplicates */
    const envNameisValid = useWorkerValidName({ workerPath :'../worker/envNameDuplicacy.js', debouncedName});

     /* handles empty input */
    const [isTouched, setIsTouched] = useState(false);
    const handleBlur = () => setIsTouched(true);

    /* getServiceNames(get names only) => have undeleted ones only */
    const services = useRecoilValue(getServiceNames);
    useEffect(() => {
        service && debouncedName && services.includes(debouncedName) ? setNameIsValid(false) : (debouncedName.includes(" ") ? setNameIsValid(false) : setNameIsValid(true));
    }, [setNameIsValid, service, services, debouncedName]);

    
    /* review */ 
    const [review, setReview] = useState(false);

    /* pm for selected managers */
    const packageManagers = useRecoilValue(selectedPackageManagerAtom(whatType));

    return ((isGuestLoggedIn || isUserLoggedIn) &&
    <div className="font-Satoshi md:m-5 sm:m-3 m-2 bg-soft-white">
        <div className="flex items-center">
            <span className="md:text-3xl sm:text-xl text-base font-semibold text-gray-700">{env?"Environment":`Service${serviceCount+1}`} name : </span>
            <input 
            type="text"
            onBlur={handleBlur}
            onChange={e => setProjName(e.target.value.trim())}
            value={projName}
            className={`border rounded md:text-lg text-sm sm:text-md font-medium px-2 text-center text-gray-700 mx-2 ${projName ? 'border-violet-500':'border-rose-500 mx-2'} enabled:hover:border-gray-400`}
            />
            {!projName && isTouched && (
                <div className="flex gap-1 items-center">
                    <IoInformationCircleOutline className="text-rose-500"/>
                    <span className="text-rose-500 text-sm">This field is required</span>
                </div>
            )}
            {env && projName && !envNameisValid && (
                <div className="flex gap-1 items-center">
                    <IoInformationCircleOutline className="text-rose-500"/>
                    <span className="text-rose-500 text-sm">Name already exists or is invalid.</span>
                </div>
            )}
            {service && projName && !nameIsValid && (
                <div className="flex gap-1 items-center">
                    <IoInformationCircleOutline className="text-rose-500"/>
                <span className="text-rose-500 text-sm">Name already exists or is invalid.</span>
            </div>
            )}
        </div>


        <div className="medium-heading">Software and tools :</div>
        <DockerSearchComponent label={"Operating System"} type={whatType}/>
        <DockerSearchComponent label={"Runtime(s)"} type={whatType}/>
        <DockerSearchComponent label={"Database(s)"} type={whatType}/>


        <div className="medium-heading">Framework and libraries :</div>
        <div className="border-2 border-gray-300/70 hover:border-gray-500/70 rounded-lg my-2 p-1 px-2">
            <PackageManager label={"Package Managers"} isMulti={true} type={whatType}/>
            {packageManagers.map((pm, key) => <RenderPackageManager pmValue={pm.value} whatType={whatType} key={key}/>)}
        </div>


        <div className="medium-heading mb-2">Choose Configurations :</div>
        <Configurations type={whatType}/>
        <Environments type={whatType}/>
        <NetworkConfig type={whatType}/>
        <Command type={whatType} />
        <div className="w-full md:text-xl sm:text-base text-sm mt-4">
            <div className="md:max-w-[10%] max-w-[30%] sm:max-w-[20%] ml-auto md:text-xl sm:text-base text-sm mr-[3vw]">
                <Button>
                    <MdReviews/>
                    <button onClick={e => setReview(state => !state)}>Review</button>
                </Button>
            </div>
        </div>
        <br />
        {review && debouncedName && ((env && envNameisValid) || (service && nameIsValid)) && <CreateDockerfile type={whatType}/>}
    </div>
    )
})

export default CreateProject;