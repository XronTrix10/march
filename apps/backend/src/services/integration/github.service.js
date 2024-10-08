import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { clerk } from "../../middlewares/clerk.middleware.js";
import { clerkClient } from "@clerk/clerk-sdk-node"
// import { Integration } from "../../models/integration/integration.model.js";
import { environment } from "../../loaders/environment.loader.js";
import { Item } from "../../models/lib/item.model.js";

const getGitHubAccessToken = async (userId) => {
    const accessTokenResponse = await clerk.users.getUserOauthAccessToken(userId, 'github');
    const token = accessTokenResponse.data[0].token;
    const externalAccountId = accessTokenResponse.data[0].externalAccountId;
    const user = await clerkClient.users.getUser(userId);
    const externalAccount = user.externalAccounts.find(account => account.id === externalAccountId);

    const username = externalAccount.username

    return { token, username };
};

const fetchInstallationDetails = async (installationId) => {
    try {
        const accessToken = await generateInstallationAccessToken(installationId);
        console.log("accessToken: ", accessToken);

        const octokit = new Octokit({ auth: accessToken });

        const { data } = await octokit.apps.getInstallation({
            installation_id: installationId
        });

        console.log('data: ', data);
        console.log('Installation Account: ', data.account.login);
        return data.account.login;
    } catch (error) {
        console.error('Error fetching installation details:', error);
        throw error;
    }
};

// const generateInstallationAccessToken = async (installationId) => {
//     console.log("installationId: ", installationId);
//     // const privateKey = environment.GITHUB_APP_PRIVATE_KEY;
//     const privateKey = environment.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');
//     console.log("privateKey: ", privateKey);
//     const auth = createAppAuth({
//         appId: environment.GITHUB_APP_ID,
//         privateKey,
//         installationId
//     });
//     console.log("hey");
//     const installationAuthentication = await auth({ type: 'installation' });
//     console.log("Generated Token: ", installationAuthentication);
//     return installationAuthentication.token;
// };

// const generateInstallationAccessToken = async (installationId) => {
//     try {
//         const privateKey = environment.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');
//         const appId = environment.GITHUB_APP_ID;

//         console.log("App ID:", appId);
//         console.log("Installation ID:", installationId);
//         console.log("Private Key (first line):", privateKey.split('\n')[0]);

//         const auth = createAppAuth({
//             appId: appId,
//             privateKey: privateKey,
//             installationId: installationId
//         });

//         const installationAuthentication = await auth({ type: 'installation' });
//         return installationAuthentication.token;
//     } catch (error) {
//         console.error('Error generating installation access token:', error);
//         if (error.response) {
//             console.error('Response status:', error.response.status);
//             console.error('Response data:', error.response.data);
//         }
//         throw error;
//     }
// };

const generateInstallationAccessToken = async (installationId) => {
    try {
        const privateKey = environment.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');
        const appId = environment.GITHUB_APP_ID;

        console.log("App ID:", appId);
        console.log("Installation ID:", installationId);
        console.log("Private Key (first line):", privateKey.split('\n')[0]);

        const auth = createAppAuth({
            appId: appId,
            privateKey: privateKey,
            installationId: installationId
        });

        const installationAuthentication = await auth({ type: 'installation' });
        return installationAuthentication.token;
    } catch (error) {
        console.error('Error generating installation access token:', error);
        throw error;
    }
};

const getUserGithubIssuesAndPRs = async (accessToken, username, userId) => {
    const octokit = new Octokit({ auth: accessToken });

    const issuesdata = await octokit.search.issuesAndPullRequests({
        q: `assignee:${username} type:issue is:open`
    });

    const pullRequestsData = await octokit.search.issuesAndPullRequests({
        q: `author:${username} type:pr is:open`
    });

    const issues = issuesdata.data.items;
    const pullRequests = pullRequestsData.data.items;

    const extractRepoDetails = (url) => {
        const match = url.match(/repos\/([^/]+)\/([^/]+)/);
        return match ? { owner: match[1], repo: match[2] } : null;
    };

    for (const issue of issues) {
        const repoDetails = extractRepoDetails(issue.repository_url);
        if (repoDetails) {
            const integration = new Item({
                title: issue.title,
                type: 'githubIssue',
                url: issue.html_url,
                id: issue.id,
                user: userId,
                metadata: {
                    org: repoDetails.owner,
                    repo: repoDetails.repo,
                    repository_url: issue.repository_url,
                    number: issue.number,
                    labels: issue.labels,
                    body: issue.body
                },
                createdAt: issue.created_at,
                updatedAt: issue.updated_at
            });
            await integration.save();
        }
    }

    for (const pr of pullRequests) {
        const repoDetails = extractRepoDetails(pr.repository_url);
        if (repoDetails) {
            const integration = new Item({
                title: pr.title,
                type: 'githubPullRequest',
                url: pr.html_url,
                id: pr.id,
                user: userId,
                metadata: {
                    org: repoDetails.owner,
                    repo: repoDetails.repo,
                    repository_url: pr.repository_url,
                    number: pr.number,
                    labels: pr.labels,
                    body: pr.body
                },
                createdAt: pr.created_at,
                updatedAt: pr.updated_at
            });
            await integration.save();
        }
    }

    return {
        issues,
        pullRequests
    };
};

export {
    getGitHubAccessToken,
    getUserGithubIssuesAndPRs,
    fetchInstallationDetails
};
