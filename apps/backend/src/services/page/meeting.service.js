import { Meeting } from "../../models/page/meetings.model.js";

const getMeeting = async (user) => {
    const meetings = await Meeting.find({
        user
    })
        .sort({ created_at: -1 });

    return meetings;
};

const getUpcomingMeetings = async (user, currentDateTime) => {
    const upcomingMeetings = await Meeting.find({
        user,
        'metadata.start.dateTime': { $gt: currentDateTime.toISOString() }
    });
    return upcomingMeetings;
};

const updateMeeting = async (id, updateData) => {
    const updatedBlock = await Meeting.findOneAndUpdate({
        uuid: id
    },
    { $set: updateData },
    { new: true }
    )

    return updatedBlock;
};

const deleteMeeting = async (id) => {
    const meeting = await Meeting.findOneAndDelete({ uuid: id });

    if (!meeting) {
        throw new Error('meeting not found');
    }
    return meeting;
};

export {
    getMeeting,
    getUpcomingMeetings,
    updateMeeting,
    deleteMeeting
}
