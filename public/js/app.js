import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    let alerts = document.querySelector('.alertas');

    if(alerts){
        cleanAlerts();
    }

    if(skills){
        skills.addEventListener('click', addSkill);

        skillsSelected();
    }

    const vacanciesList = document.querySelector('.panel-administracion');

    if(vacanciesList){
        vacanciesList.addEventListener('click', actionList);
    }
});

const skills = new Set();

const addSkill = e => {
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');    
        }else{
            skills.add(e.target.textContent);
            e.target.classList.add('activo');    
        }
    }

    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}

const skillsSelected = () => {
    const selected = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    selected.forEach(selected => {
        skills.add(selected.textContent);
    })

    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}

const cleanAlerts = () => {
    const alerts = document.querySelector('.alertas');

    const interval = setInterval(() => {
        if(alerts.children.length > 0){
            alerts.removeChild(alerts.children[0]);
        }else if(alerts.children.length === 0){
            alerts.parentElement.removeChild(alerts);
            clearInterval(interval);
        }
    }, 2000);
}

const actionList = e => {
    e.preventDefault();
    if(e.target.dataset.delete){        
        Swal.fire({
            title: '¿Seguro deseas eliminar esta vacante?',
            text: "Una vez eliminada no se podrá recuperar.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'No, cancelar', 
          }).then((result) => {
            if (result.isConfirmed) {
                const url = `${location.origin}/vacancies/delete/${e.target.dataset.delete}`;
                console.log(url);
                axios.delete(url, {params: {url}})
                    .then(function (response){
                        if(response.status === 200){
                            Swal.fire(
                                '¡Eliminada!',
                                response.data,
                                'success'
                            );
                            
                            e.target.parentElement.parentElement.parentElement.removeChild(
                                e.target.parentElement.parentElement);
                        }
                    }).catch(() => {
                        Swal.fire({
                            type: 'error',
                            title: 'Hubo un error',
                            text: 'No se ha podido eliminar'
                        });
                    });                
            }
          })
    }else if (e.target.tagName === 'A'){
        window.location.href = e.target.href;
    }
}