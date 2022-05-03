(function () {   // why IIFE- becoz if there are multiple javascript files, then variables may collide with each other
    let saveAlbumSpan = document.querySelector("#saveAlbum")
    let addAlbumSpan = document.querySelector("#addAlbum")
    let deleteAlbumSpan = document.querySelector("#deleteAlbum")
    let downloadAlbumSpan = document.querySelector("#downloadAlbum")
    let uploadAlbumSpan = document.querySelector("#uploadAlbum")
    let uploadAlbumInput = document.querySelector("#uploadAlbumInput")
    let playAlbumSpan = document.querySelector("#playAlbum")
    let selectAlbumSpan = document.querySelector("#selectAlbum")
    

    let templates = document.querySelector("#templates")

    let overlayDiv = document.querySelector("#overlay")
    let contentDetailsOverlayDiv = document.querySelector("#content-details-overlay")
    let playOverlayDiv = document.querySelector("#play-overlay")

    let newImageDiv = document.querySelector("#new-image")
    let createImageDiv = document.querySelector("#create-image")
    let showImageDiv = document.querySelector("#show-image")

    let slideImgInput = document.querySelector("#slideImg")
    let slideTitleInput = document.querySelector("#slideTitle")
    let slideDescriptionInput = document.querySelector("#slideDescription")
    let slideSaveBtn = document.querySelector("#slideSave")

    let titlename = ""

    let imagesListDiv = document.querySelector("#images-list")

    let albums = []

    addAlbumSpan.addEventListener("click", addAlbum)
    selectAlbumSpan.addEventListener("change", selectAlbum)
    newImageDiv.addEventListener("click", newImage)
    slideSaveBtn.addEventListener("click", slideSave)
    saveAlbumSpan.addEventListener("click", saveAlbumToLocalStorage)
    deleteAlbumSpan.addEventListener("click", deleteAlbum)
    downloadAlbumSpan.addEventListener("click", downloadAlbum)
    uploadAlbumSpan.addEventListener("click", function () {
        uploadAlbumInput.click()
    })
    uploadAlbumInput.addEventListener("change", uploadAlbum)
    playAlbumSpan.addEventListener("click", playAlbum)

    function getAlbumsFromLocalStorage() {
        let albumsObj = []
        albumsObj = JSON.parse(localStorage.getItem("albumsData"))
        if (!albumsObj) return

        albums = albumsObj
        for (let i = 0; i < albumsObj.length; i++) {
            let optionTemplate = templates.content.querySelector("[for='new-album']")
            let newAlbumOption = document.importNode(optionTemplate, true)

            newAlbumOption.setAttribute("value", albumsObj[i].name)
            newAlbumOption.innerHTML = albumsObj[i].name
            selectAlbumSpan.appendChild(newAlbumOption)

        }
        selectAlbum.value = "-1"

    }

    getAlbumsFromLocalStorage()

    function addAlbum() {
        let albumName = prompt("Enter album's name")
        if (albumName == null) return

        albumName = albumName.trim()
        if (!albumName) {
            alert("Name is empty")
            return
        }

        let exists = albums.some(a => a.name == albumName)
        if (exists) {
            alert(albumName + " already exists.")
            return
        }

        let optionTemplate = templates.content.querySelector("[for='new-album']")
        let newAlbumOption = document.importNode(optionTemplate, true)
        newAlbumOption.setAttribute("value", albumName)
        newAlbumOption.innerHTML = albumName
        selectAlbumSpan.appendChild(newAlbumOption)

        let album = {
            name: albumName,
            images: []
        }
        albums.push(album)
        saveAlbumToLocalStorage()

        selectAlbumSpan.value = albumName
        selectAlbumSpan.dispatchEvent(new Event("change"))
    }

    function deleteAlbum() {
        let aname = selectAlbumSpan.value
        if (aname == "-1") {
            alert("Select an album to delete")
            return
        }

        let i = albums.findIndex(a => a.name == aname)
        albums.splice(i, 1)

        saveAlbumToLocalStorage()

        selectAlbumSpan.remove(selectAlbumSpan.selectedIndex)

        imagesListDiv.innerHTML = ""
        selectAlbum.value = "-1"
        overlayDiv.style.display = "block"
        contentDetailsOverlayDiv.style.display = "none"
        createImageDiv.style.display = "none"
        showImageDiv.style.display = "none"
    }

    function saveAlbumToLocalStorage() {
        let albumsStr = JSON.stringify(albums)
        localStorage.setItem("albumsData", albumsStr)
    }

    function selectAlbum() {
        if (this.value == "-1") {
            overlayDiv.style.display = "block"
            contentDetailsOverlayDiv.style.display = "none"
            createImageDiv.style.display = "none"
            showImageDiv.style.display = "none"
        }
        else {
            overlayDiv.style.display = "none"
            contentDetailsOverlayDiv.style.display = "block"
            createImageDiv.style.display = "none"
            showImageDiv.style.display = "none"

            let a = albums.find(a => a.name == selectAlbumSpan.value)
            imagesListDiv.innerHTML = ""
            for (let i = 0; i < a.images.length; i++) {
                let slideTemplate = templates.content.querySelector(".slide")
                let slideDiv = document.importNode(slideTemplate, true)

                slideDiv.querySelector(".slide-title").innerHTML = a.images[i].title
                slideDiv.querySelector(".slide-des").innerHTML = a.images[i].description
                slideDiv.querySelector(".slide-img img").setAttribute("src", a.images[i].imgsrc)
                slideDiv.addEventListener("click", slideClick)

                a.images[i].selected = false

                imagesListDiv.appendChild(slideDiv)
            }

            let firstSlideDiv = imagesListDiv.children[0]
            if (firstSlideDiv) {
                firstSlideDiv.dispatchEvent(new Event("click"))
            }
        }





    }

    function newImage() {
        overlayDiv.style.display = "none"
        contentDetailsOverlayDiv.style.display = "none"

        slideImgInput.value = ""
        slideTitleInput.value = ""
        slideDescriptionInput.value = ""

        createImageDiv.style.display = "block"
        showImageDiv.style.display = "none"

        slideSaveBtn.setAttribute("editSlidePurpose", "create")
    }

    function slideSave() {
        let imgUrl = slideImgInput.value
        let slideTitle = slideTitleInput.value
        let slideDes = slideDescriptionInput.value

        if (this.getAttribute("editSlidePurpose") == "create") {
            let slideTemplate = templates.content.querySelector(".slide")
            let slideDiv = document.importNode(slideTemplate, true)

            slideDiv.querySelector(".slide-title").innerHTML = slideTitle
            slideDiv.querySelector(".slide-des").innerHTML = slideDes
            slideDiv.querySelector(".slide-img img").setAttribute("src", imgUrl)
            slideDiv.addEventListener("click", slideClick)

            imagesListDiv.appendChild(slideDiv)

            let a = albums.find(a => a.name == selectAlbumSpan.value)
            a.images.push({ title: slideTitle, description: slideDes, imgsrc: imgUrl })
            saveAlbumToLocalStorage()

            slideDiv.dispatchEvent(new Event("click"))
        }
        else {
            let album = albums.find(a => a.name == selectAlbumSpan.value)
            let slideToUpdate = album.images.find(i => i.selected == true)

            let s
            for (let i = 0; i < imagesListDiv.children.length; i++) {
                let e = imagesListDiv.children[i]
                if (e.querySelector(".slide-title").innerHTML == slideToUpdate.title) {
                    s = e
                    break
                }

            }
            s.querySelector(".slide-title").innerHTML = slideTitle
            s.querySelector(".slide-des").innerHTML = slideDes
            s.querySelector("img").setAttribute("src", imgUrl)

            s.addEventListener("click", slideClick)

            slideToUpdate.title = slideTitle
            slideToUpdate.description = slideDes
            slideToUpdate.imgsrc = imgUrl
            saveAlbumToLocalStorage()

            s.dispatchEvent(new Event("click"))

        }
    }

    function slideClick() {

        createImageDiv.style.display = "none"
        showImageDiv.style.display = "block"

        showImageDiv.innerHTML = ""
        let slideViewTemplate = templates.content.querySelector(".slideView")
        let slideViewDiv = document.importNode(slideViewTemplate, true)

        titlename = this.querySelector(".slide-title").innerHTML
        slideViewDiv.querySelector(".slide-title").innerHTML = this.querySelector(".slide-title").innerHTML
        slideViewDiv.querySelector(".slide-des").innerHTML = this.querySelector(".slide-des").innerHTML
        slideViewDiv.querySelector("img").setAttribute("src", this.querySelector("img").getAttribute("src"))
        slideViewDiv.querySelector("[for='editSlide']").addEventListener("click", editSlide)
        slideViewDiv.querySelector("[for='deleteSlide']").addEventListener("click", deleteSlide)

        showImageDiv.append(slideViewDiv)

        let album = albums.find(a => a.name == selectAlbumSpan.value)
        for (let i = 0; i < album.images.length; i++) {
            if (album.images[i].title == this.querySelector(".slide-title").innerHTML) {
                album.images[i].selected = true
            }
            else {
                album.images[i].selected = false
            }
        }
    }

    function deleteSlide() {

        let album = albums.find(a => a.name == selectAlbumSpan.value)
        let i = album.images.findIndex(i => i.title == titlename)
        album.images.splice(i, 1)

        saveAlbumToLocalStorage()

        for (let i = 0; i < imagesListDiv.children.length; i++) {
            let sname = imagesListDiv.children[i].querySelector(".slide-title").innerHTML
            if (sname == titlename) {
                imagesListDiv.removeChild(imagesListDiv.children[i])

                contentDetailsOverlayDiv.style.display = "block"
                showImageDiv.style.display = "none"
                break
            }
        }

    }

    function editSlide() {
        overlayDiv.style.display = "none"
        contentDetailsOverlayDiv.style.display = "none"
        createImageDiv.style.display = "block"
        showImageDiv.style.display = "none"

        let album = albums.find(a => a.name == selectAlbumSpan.value)
        let i = album.images.find(i => i.selected == true)

        slideTitle.value = i.title
        slideImgInput.value = i.imgsrc
        slideDescriptionInput.value = i.description

        slideSaveBtn.setAttribute("editSlidePurpose", "update")

    }

    function downloadAlbum() {
        if (selectAlbumSpan.value == -1) {
            alert("Select an album")
            return
        }
        let album = albums.find(a => a.name == selectAlbumSpan.value)
        let ajson = JSON.stringify(album)
        let encodedjson = encodeURIComponent(ajson)

        let a = document.createElement("a")
        a.setAttribute("download", album.name + ".json")
        a.setAttribute("href", "data:, " + encodedjson)

        a.click()
    }

    function uploadAlbum() {
        let file = window.event.target.files[0]

        let reader = new FileReader()
        reader.addEventListener("load", function () {
            let data = window.event.target.result
            let importedAlbum = JSON.parse(data)

            let album = albums.find(a => a.name == selectAlbumSpan.value)
            album.images = album.images.concat(importedAlbum.images)

            for (let i = 0; i < album.images.length; i++) {
                let slideTemplate = templates.content.querySelector(".slide")
                let slideDiv = document.importNode(slideTemplate, true)

                slideDiv.querySelector(".slide-title").innerHTML = album.images[i].title
                slideDiv.querySelector(".slide-des").innerHTML = album.images[i].description
                slideDiv.querySelector(".slide-img img").setAttribute("src", album.images[i].imgsrc)

                imagesListDiv.appendChild(slideDiv)
            }
        })
        reader.readAsText(file)
    }

    function playAlbum(){
        if (selectAlbumSpan.value == -1) {
            alert("Select an album")
            return
        }

        playOverlayDiv.style.display = "block"
        let album = albums.find(a => a.name == selectAlbumSpan.value)
        let i = 0, counter = album.images.length

        let id = setInterval(function(){
            
            if(i < counter){
                imagesListDiv.children[i].click()
                playOverlayDiv.querySelector("span").innerHTML = "Slide "+ ++i
            }
            else if(i == counter){
                clearInterval(id)
                playOverlayDiv.style.display = "none"
                
                // try writing below code
                // playOverlayDiv.style.display = "none"
                // clearInterval(id)
            }
        }, 1000)
    }

})()