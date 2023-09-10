import {useEffect,useState} from 'react';
import { useApiRequest } from './useApiRequest';
import Store from '../../store';
import { ipcRenderer} from 'electron';
function QuarantineHandler() {
    const [quarantineData, setquarantineData] = useState([]);
    const [previous, setPrevious] = useState(0);
    const [next, setNext] = useState(10);
    var handleQuar = (id,type) => {
        console.log("Handling: "+id)
        const url = type+"File"
        useApiRequest('http://127.0.0.1:5000/'+url, 'POST', { originalPath: id })
        .then(data => console.log(data))
        .then(() => window.location.reload());
    }
    var prevBtn = () => {
        if(previous>0){
            setPrevious(previous - 10);
            setNext(next - 10);
        }
    }
    var nextBtn = () => {
        if (next < Object.keys(quarantineData).length){
            setPrevious(previous + next);
            setNext(next + 10);
        }
    }

    useEffect(() => {
        ipcRenderer.send('xylent-get-path', "XYLENT_GET_APP_PATH");
        ipcRenderer.once('xylent-get-path', (event, basePath) => {
            const store = new Store({
                configName: "quar_info",
                defaults: {},
                userPath: basePath + "/config/"
            });
            var getData = () => {
                var data = store.getAll();
                return data
            }
            setquarantineData(getData());
        })
        
    }, []);
    
    return (
        <table>
            <tbody>
            {   
                Object.keys(quarantineData).length ?
                Object.keys(quarantineData).slice(previous, next).map((val) => {
                    return(
                        <tr key={val}>
                            <td className='quarTable'>{val}</td>
                            <td>{quarantineData[val]}</td>
                            <td><button id={val} className='itemStatusPill' style={{ 'backgroundColor': "lightgrey" }} onClick={(e) => handleQuar(e.target.id,'restore')}>Restore</button></td>
                            <td><button id={val} className='itemStatusPill' style={{ 'backgroundColor': 'lightblue' }} onClick={(e) => handleQuar(e.target.id,'remove')}>Delete</button></td>
                        </tr>
                    )
                })
                :
                <tr>
                    <td><h4>No items in quarantined!</h4></td>
                </tr>
                
            }
            <br/>
            <tr>
                <td><button onClick={prevBtn}>Previous</button></td>
                <td><button onClick={nextBtn}>Next</button></td>
            </tr>
            </tbody>
        </table>
    )
}

export default QuarantineHandler