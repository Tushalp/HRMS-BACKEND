const Announcelist = require('../models/announcement')


function formatTimeWithSeconds(time) {
    const [hours, minutes] = time.split(':');
    const formattedHours = hours.padStart(2, '0'); 
    const formattedMinutes = minutes.padStart(2, '0');  
    return `${formattedHours}:${formattedMinutes}:00`;  
}

const saveAnnouncement = async (req, res) => {
    try {
   
        const { title, conductedBy, date, startTime, endTime } = req.body;

       
        if (!title || !conductedBy || !date || !startTime || !endTime) {
            return res.status(400).json({
                message: "Please fill all the fields",
            });
        }

       
        const formattedStartTime = formatTimeWithSeconds(startTime);
        const formattedEndTime = formatTimeWithSeconds(endTime);

       
        const announcement = await Announcelist.create({
            title,
            conductedBy,
            date,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
        });

        res.status(201).json({
            message: "Announcement data saved successfully",
            announcement,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error in saving announcement",
        });
    }
};


const getAllAnnouncement = async (req, res) => {
    try {
        
        const announcements = await Announcelist.findAll(); 
        
        if (announcements.length === 0) {
            return res.status(404).json({
                message: "No announcements found",
            });
        }

      
        res.status(200).json({
            message: "All announcements fetched successfully",
            announcements,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error in fetching all announcements",
        });
    }
};


const deleteAnnouncement = async(req,res)=>{
    try {

        const {id} =req.params;
        const announcement = await Announcelist.destroy({where:{id:id}});
        if(!announcement){
            return res.status(404).json({
                message: "Announcement not found",
                });
                }
                res.status(200).json({
                    message: "Announcement deleted successfully",
                    });
                    
        
    }  catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error in delete document",
        });
    }
}
module.exports = {
    saveAnnouncement,
    getAllAnnouncement,
    deleteAnnouncement
}